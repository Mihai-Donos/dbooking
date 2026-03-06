<?php

namespace App\Http\Controllers\Host;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Booking;
use App\Enums\OfferChargeType;
use App\Enums\BookingStatus;
use App\Enums\BookingBulkAction;

use Illuminate\Http\Request;
use Inertia\Inertia;


class HostEventBookingController extends Controller
{
    public function index(Request $request, Event $event)
    {
        $user = $request->user();
        abort_unless($user, 403);

        // Optional: prüfen, ob der User Host dieses Events ist
        // abort_unless($event->host_id === $user->id, 403);

        $bookings = $event->bookings()
            ->with([
                'user:id,email',
                'room:id,number',
                // Wichtig: items NICHT mehr hier auf PER_BOOKING einschränken,
                // sonst haben wir später kein PER_DAY-Item mehr.
                'items',
            ])
            ->orderBy('from_date')
            ->orderBy('customer_name')
            ->get()
            ->map(function (Booking $b) {
                // Status berechnen
                $rawStatus = $b->status;

                $statusEnum = $rawStatus instanceof BookingStatus
                    ? $rawStatus
                    : BookingStatus::from((int) $rawStatus);

                // Collection der Items
                $allItems = $b->items ?? collect();

                // PER_BOOKING-Zuschläge (wie bisher)
                $perBookingItems = $allItems->where(
                    'charge_type',
                    OfferChargeType::PER_BOOKING->value
                );

                // Beispiel: Personentyp aus erstem PER_DAY-Item-Name ableiten
                $perDayItem = $allItems->firstWhere(
                    'charge_type',
                    OfferChargeType::PER_DAY->value
                );

                $personType = $perDayItem?->name; // <--- HIER hast du das name-Feld aus BookingItems
    
                return [
                    'id' => $b->id,
                    'customer_name' => $b->customer_name,
                    'from_date' => $b->from_date,
                    'to_date' => $b->to_date,
                    'nights' => $b->nights,
                    'total_amount' => $b->total_amount,

                    'status' => $statusEnum->value,
                    'status_label' => $statusEnum->label(),

                    // Personentyp (z.B. "Erwachsener", "Kind", …)
                    'person_type' => $personType,

                    // Flags für Zimmer-Optionen (für die Icons)
                    'single_room' => (bool) $b->single_room,
                    'baby_bed' => (bool) $b->baby_bed,

                    'room' => $b->room ? [
                        'id' => $b->room->id,
                        'number' => $b->room->number,
                    ] : null,

                    'user' => $b->user ? [
                        'id' => $b->user->id,
                        'email' => $b->user->email,
                    ] : null,

                    // Pauschalen / Zuschläge pro Buchung (PER_BOOKING)
                    'per_booking_items' => $perBookingItems->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'name' => $item->name,       // 👈 name aus BookingItems
                            'line_total' => $item->line_total,
                        ];
                    })->values(),
                ];
            });

        // Kleine Summary für Header / Tabs
        $summary = [
            'bookings_count' => $bookings->count(),
            'status_counts' => [
                'in_review' => $bookings->where('status', BookingStatus::InReview->value)->count(),
                'confirmed' => $bookings->where('status', BookingStatus::Confirmed->value)->count(),
                'cancelled' => $bookings->where('status', BookingStatus::Cancelled->value)->count(),
                'completed' => $bookings->where('status', BookingStatus::Completed->value)->count(),
            ],
        ];

        $bulkActions = collect(BookingBulkAction::cases())
            ->map(fn(BookingBulkAction $case) => [
                'value' => $case->value,
                'label' => $case->label(),
            ])
            ->values()
            ->all();

        return Inertia::render('Host/EventBookings/Index', [
            'event' => [
                'id' => $event->id,
                'name' => $event->name,
                'description' => $event->description,
                'start_date' => $event->start_date,
                'end_date' => $event->end_date,
                'location' => $event->location ? [
                    'id' => $event->location->id,
                    'name' => $event->location->name,
                ] : null,
            ],
            'bookings' => $bookings,
            'summary' => $summary,
            'bulkActions' => $bulkActions,
        ]);
    }

    public function bulk(Request $request, Event $event)
    {
        $user = $request->user();
        abort_unless($user, 403);

        // 🔐 Optional: sicherstellen, dass der User Host dieses Events ist
        // abort_unless($event->host_id === $user->id, 403);

        // 1. Validierung der Daten aus dem Frontend
        $data = $request->validate([
            'action' => ['required', 'string'],
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:bookings,id'],
        ]);

        // 2. Action-Enum ermitteln
        $actionEnum = BookingBulkAction::tryFrom($data['action']);

        if (!$actionEnum) {
            return back()->withErrors([
                'action' => 'Unbekannte Bulk-Aktion.',
            ]);
        }

        // 3. Nur Buchungen dieses Events bearbeiten (Sicherheit!)
        $query = Booking::where('event_id', $event->id)
            ->whereIn('id', $data['ids']);

        // 4. Je nach Aktion verarbeiten
        switch ($actionEnum) {
            case BookingBulkAction::StatusInReview:
                $query->update([
                    'status' => BookingStatus::InReview->value,
                ]);
                $message = 'Status auf "In Bearbeitung" gesetzt.';
                break;

            case BookingBulkAction::StatusConfirmed:
                $query->update([
                    'status' => BookingStatus::Confirmed->value,
                ]);
                $message = 'Status auf "Bestätigt" gesetzt.';
                break;

            case BookingBulkAction::StatusCancelled:
                $query->update([
                    'status' => BookingStatus::Cancelled->value,
                ]);
                $message = 'Status auf "Storniert" gesetzt.';
                break;

            case BookingBulkAction::ResetRoom:
                $query->update([
                    'room_id' => null,
                ]);
                $message = 'Zimmerzuweisungen wurden zurückgesetzt.';
                break;

            case BookingBulkAction::Delete:
                // ⚠️ Vorsicht: wirkliche Löschung – evtl. vorher confirm im UI!
                $count = (clone $query)->count();
                $query->delete();
                $message = $count . ' Buchungen gelöscht.';
                break;

            case BookingBulkAction::ExportCsv:
                // Placeholder – hier könntest du später einen Export implementieren
                $message = 'Export ist noch nicht implementiert.';
                break;

            default:
                $message = 'Keine Aktion ausgeführt.';
                break;
        }

        return redirect()
            ->route('host.events.bookings', $event->id)
            ->with('success', $message);
    }
}

