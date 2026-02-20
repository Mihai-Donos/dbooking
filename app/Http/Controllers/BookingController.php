<?php

namespace App\Http\Controllers;

use App\Enums\EventStatus;
use App\Enums\OfferChargeType;
use App\Models\Booking;
use App\Models\BookingItem;
use App\Models\Event;
use App\Models\Offer;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class BookingController extends Controller
{
    public function create(Request $request, Event $event)
    {
        // Nur eingeloggt buchen
        $user = $request->user();
        abort_unless($user, 403);

        // Nur buchbare Events: sichtbar + Zukunft + Status Registrierung offen
        $now = now();

        abort_if($event->start_date < $now, 404);
        abort_if($event->booking_visible_from > $now, 404);
        abort_if($event->booking_visible_to < $now, 404);

        // Nur Status Anmeldung möglich
        $statusValue = ($event->status instanceof EventStatus) ? $event->status->value : (int) $event->status;
        abort_if($statusValue !== EventStatus::RegistrationOpen->value, 404);

        $event->load(['location:id,name']);

        // Nur sichtbare Offers (Pivot visible = true)
        $offers = $event->offers()
            ->wherePivot('visible', true)
            ->whereNotNull('event_offers.price')
            ->get(['offers.id', 'offers.name', 'offers.type', 'offers.charge_type', 'offers.description'])
            ->map(function (Offer $o) {
                $typeEnum = $o->type;          // kann Enum oder int sein
                $chargeEnum = $o->charge_type; // kann Enum oder int sein
    
                $typeValue = $typeEnum instanceof \App\Enums\OfferType ? $typeEnum->value : (int) $typeEnum;
                $chargeValue = $chargeEnum instanceof \App\Enums\OfferChargeType ? $chargeEnum->value : (int) $chargeEnum;

                return [
                    'id' => $o->id,
                    'name' => $o->name,

                    'type' => $typeValue,
                    'type_label' => $typeEnum instanceof \App\Enums\OfferType
                        ? $typeEnum->label()
                        : (\App\Enums\OfferType::from($typeValue)->label()),

                    'charge_type' => $chargeValue,
                    'charge_type_label' => $chargeEnum instanceof \App\Enums\OfferChargeType
                        ? $chargeEnum->label()
                        : (\App\Enums\OfferChargeType::from($chargeValue)->label()),

                    'price' => (string) ($o->pivot->price ?? "0.00"),
                    'description' => $o->description,
                ];
            });

        $perDay = $offers->filter(fn($o) => (int) $o['charge_type'] === OfferChargeType::PER_DAY->value)->values();
        $perBooking = $offers->filter(fn($o) => (int) $o['charge_type'] === OfferChargeType::PER_BOOKING->value)->values();

        // Gesamtkosten der Buchungen pro Veranstaltung
        $userEventTotalAmount = Booking::query()
            ->where('event_id', $event->id)
            ->where('user_id', $user->id)
            ->sum('total_amount');

        // Anzahl der Buchungen pro Veranstaltung
        $userEventBookingCount = Booking::query()
            ->where('event_id', $event->id)
            ->where('user_id', $user->id)
            ->count();

        // ✅ Buchungen des Users für dieses Event (für aufklappbare Liste)
        $userEventBookings = Booking::query()
            ->where('event_id', $event->id)
            ->where('user_id', $user->id)
            ->with([
                'items' => function ($q) {
                    $q->select('id', 'booking_id', 'offer_id', 'name', 'charge_type', 'unit_price', 'quantity', 'line_total');
                }
            ])
            ->orderByDesc('id')
            ->get()
            ->map(function (Booking $b) {
                // PER_DAY Item als "Offering name" in Kurzform (falls vorhanden)
                $perDayItem = $b->items->firstWhere('charge_type', \App\Enums\OfferChargeType::PER_DAY->value);

                return [
                    'id' => $b->id,
                    'customer_name' => $b->customer_name,
                    'nights' => (int) $b->nights,
                    'total_amount' => (string) number_format((float) $b->total_amount, 2, ',', '.'),
                    'offering_name' => $perDayItem?->name ?? '—',
                ];
            });



        return Inertia::render('Bookings/New', [
            'event' => [
                'id' => $event->id,
                'name' => $event->name,
                'description' => $event->description,
                'start_date' => optional($event->start_date)->toDateTimeString(),
                'end_date' => optional($event->end_date)->toDateTimeString(),
                'location' => $event->location ? [
                    'id' => $event->location->id,
                    'name' => $event->location->name,
                ] : null,
                'status' => [
                    'value' => $statusValue,
                    'label' => $event->status instanceof EventStatus
                        ? $event->status->label()
                        : EventStatus::from($statusValue)->label(),
                ],
            ],

            // ✅ Frontend erwartet "offers"
            'offers' => $offers->values(),

            // ✅ optional: wenn du es weiterhin separat brauchst (schadet nicht)
            'offers_per_day' => $perDay,
            'offers_per_booking' => $perBooking,

            // ✅ Frontend erwartet "chargeTypes"
            'chargeTypes' => [
                'PER_BOOKING' => OfferChargeType::PER_BOOKING->value,
                'PER_DAY' => OfferChargeType::PER_DAY->value,
            ],

            'user_event_total_amount' => (float) $userEventTotalAmount,
            'user_event_booking_count' => (int) $userEventBookingCount,
            'user_event_bookings' => $userEventBookings,


            // ✅ Frontend erwartet "flashSuccess"
            'flashSuccess' => session('success'),
        ]);
    }

    public function store(Request $request, Event $event)
    {
        $user = $request->user();
        abort_unless($user, 403);

        $now = now();

        // Event muss weiterhin "buchbar" sein
        abort_if($event->start_date < $now, 404);
        abort_if($event->booking_visible_from > $now, 404);
        abort_if($event->booking_visible_to < $now, 404);
        // zusätzlich absichern: from muss strikt vor to liegen (inkl. Uhrzeit)


        $statusValue = ($event->status instanceof EventStatus) ? $event->status->value : (int) $event->status;
        abort_if($statusValue !== EventStatus::RegistrationOpen->value, 404);

        $validated = $request->validate([
            'from_date' => ['required', 'date'],
            'to_date' => ['required', 'date', 'after:from_date'],

            // exakt 1 PER_DAY offering
            'per_day_offering_id' => ['required', 'integer'],

            // Name (Vorname, Name) – kommt aus dem Frontend unter per_day.label
            'per_day.label' => ['required', 'string', 'max:255'],

            // 0..n PER_BOOKING offerings
            'per_booking_offering_ids' => ['array'],
            'per_booking_offering_ids.*' => ['integer'],

            // Optionen
            'glutenfree' => ['boolean'],
            'vegetarian' => ['boolean'],
            'lactose_free' => ['boolean'],
            'single_room' => ['boolean'],
            'baby_bed' => ['boolean'],
        ]);

        $from = Carbon::parse($validated['from_date']);
        $to = Carbon::parse($validated['to_date']);

        // ✅ Event-Zeitraum sauber als Carbon vergleichen (keine Typ-Mischung)
        $eventStart = Carbon::parse($event->start_date);
        $eventEnd = Carbon::parse($event->end_date);

        // ✅ innerhalb Event-Zeitraum bleiben -> als VALIDATION ERROR zurückgeben
        if ($from->lt($eventStart)) {
            return back()->withErrors([
                'from_date' => 'Der zu frühe Vogel, fängt garkein Wurm!',
            ]);
        }

        if ($to->gt($eventEnd)) {
            return back()->withErrors([
                'to_date' => 'Schön dass du länger bleiben willst, geht leider nicht!',
            ]);
        }

        // ✅ zusätzlich: to > from (falls Zeitzonen/Uhrzeiten mal gleich werden)
        if ($to->lte($from)) {
            return back()->withErrors([
                'to_date' => 'Zeitreisen werden nicht angeboten!',
            ]);
        }

        // Nächte zählen (checkout - checkin)
        $nights = (int) $from->copy()->startOfDay()->diffInDays($to->copy()->startOfDay());
        if ($nights <= 0) {
            return back()->withErrors([
                'to_date' => 'Der Zeitraum muss mindestens 1 Nacht umfassen.',
            ]);
        }

        // ✅ Minimal Patch: Pivot-Filter sauber über wherePivot*
        $visibleOffers = $event->offers()
            ->wherePivot('visible', true)
            ->wherePivotNotNull('price')
            ->get()
            ->keyBy('id');

        // PER_DAY offering prüfen
        $perDayId = (int) $validated['per_day_offering_id'];
        if (!$visibleOffers->has($perDayId)) {
            return back()->withErrors([
                'per_day_offering_id' => 'Ungültiges Angebot (pro Nacht).',
            ]);
        }

        $perDayOffer = $visibleOffers->get($perDayId);
        $perDayCharge = ($perDayOffer->charge_type instanceof \App\Enums\OfferChargeType)
            ? $perDayOffer->charge_type->value
            : (int) $perDayOffer->charge_type;

        if ($perDayCharge !== OfferChargeType::PER_DAY->value) {
            return back()->withErrors([
                'per_day_offering_id' => 'Das ausgewählte Angebot ist nicht "pro Nacht".',
            ]);
        }

        // PER_BOOKING offerings prüfen
        $perBookingIds = array_values(array_unique(array_map('intval', $validated['per_booking_offering_ids'] ?? [])));

        foreach ($perBookingIds as $oid) {
            if (!$visibleOffers->has($oid)) {
                return back()->withErrors([
                    'per_booking_offering_ids' => 'Mindestens ein ausgewähltes Zusatz-Angebot ist ungültig.',
                ]);
            }

            $o = $visibleOffers->get($oid);
            $charge = ($o->charge_type instanceof \App\Enums\OfferChargeType)
                ? $o->charge_type->value
                : (int) $o->charge_type;

            if ($charge !== OfferChargeType::PER_BOOKING->value) {
                return back()->withErrors([
                    'per_booking_offering_ids' => 'Mindestens ein ausgewähltes Zusatz-Angebot ist nicht "einmalig".',
                ]);
            }
        }

        return DB::transaction(function () use ($user, $event, $validated, $from, $to, $nights, $visibleOffers, $perDayOffer, $perBookingIds) {
            // ✅ Booking Head (normalisiert)
            $booking = Booking::create([
                'event_id' => $event->id,
                'user_id' => $user->id,

                'from_date' => $from,
                'to_date' => $to,

                // ✅ customer_name im bookings-head
                'customer_name' => $validated['per_day']['label'],

                'nights' => $nights,
                'total_amount' => 0,

                'glutenfree' => (bool) ($validated['glutenfree'] ?? false),
                'vegetarian' => (bool) ($validated['vegetarian'] ?? false),
                'lactose_free' => (bool) ($validated['lactose_free'] ?? false),
                'single_room' => (bool) ($validated['single_room'] ?? false),
                'baby_bed' => (bool) ($validated['baby_bed'] ?? false),
            ]);

            // --- Items ---
            $sum = 0.0;

            // PER_DAY line
            $perDayUnitStr = (string) ($perDayOffer->pivot->price ?? "0.00");
            $perDayUnit = (float) str_replace(',', '.', $perDayUnitStr);
            $perDayTotal = round($perDayUnit * $nights, 2);

            BookingItem::create([
                'booking_id' => $booking->id,
                'offer_id' => $perDayOffer->id,
                'name' => $perDayOffer->name, // Snapshot
                'charge_type' => OfferChargeType::PER_DAY->value,
                'unit_price' => $perDayUnit,
                'quantity' => $nights,
                'line_total' => $perDayTotal,
            ]);

            $sum += $perDayTotal;

            // PER_BOOKING lines
            foreach ($perBookingIds as $oid) {
                $o = $visibleOffers->get($oid);

                $unitStr = (string) ($o->pivot->price ?? "0.00");
                $unit = (float) str_replace(',', '.', $unitStr);
                $line = round($unit * 1, 2);

                BookingItem::create([
                    'booking_id' => $booking->id,
                    'offer_id' => $o->id,
                    'name' => $o->name, // Snapshot
                    'charge_type' => OfferChargeType::PER_BOOKING->value,
                    'unit_price' => $unit,
                    'quantity' => 1,
                    'line_total' => $line,
                ]);

                $sum += $line;
            }

            $booking->update(['total_amount' => round($sum, 2)]);

            return back()->with('success', 'Buchung gespeichert.');
        });
    }


    public function destroy(Request $request, Event $event, Booking $booking)
    {
        $user = $request->user();
        abort_unless($user, 403);

        // Ownership + Event-Scope prüfen
        abort_unless((int) $booking->user_id === (int) $user->id, 403);
        abort_unless((int) $booking->event_id === (int) $event->id, 404);

        return DB::transaction(function () use ($booking) {
            // Falls FK-CASCADE nicht aktiv ist:
            $booking->items()->delete();

            $booking->delete();

            return back()->with('success', 'Buchung gelöscht.');
        });
    }
}