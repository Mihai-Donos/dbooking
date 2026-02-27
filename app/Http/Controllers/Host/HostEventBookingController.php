<?php

namespace App\Http\Controllers\Host;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Booking;
use App\Enums\OfferChargeType;
use App\Enums\BookingStatus;
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
                'items' => function ($q) {
                    $q->where('charge_type', OfferChargeType::PER_BOOKING->value);
                },
            ])
            ->orderBy('from_date')
            ->orderBy('customer_name')
            ->get()
            ->map(function (Booking $b) {
                // ✅ Status pro Buchung berechnen
                $rawStatus = $b->status;

                $statusEnum = $rawStatus instanceof BookingStatus
                    ? $rawStatus
                    : BookingStatus::from((int) $rawStatus);

                return [
                    'id' => $b->id,
                    'customer_name' => $b->customer_name,
                    'from_date' => $b->from_date,
                    'to_date' => $b->to_date,
                    'nights' => $b->nights,
                    'total_amount' => $b->total_amount,

                    'status' => $statusEnum->value,
                    'status_label' => $statusEnum->label(),

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

                    // Pauschalen / Zuschläge pro Buchung
                    'per_booking_items' => $b->items->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'name' => $item->name,
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
            // optional: initial aktiver Tab
            // 'activeStatus' => $request->query('status', 'in_review'),
        ]);
    }
}