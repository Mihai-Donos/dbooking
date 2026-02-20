<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Enums\EventStatus;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VeranstaltungController extends Controller
{
    public function index(Request $request)
    {
        $now = now();

        $events = Event::query()
            ->with(['location:id,name'])
            // nur zukünftige Events
            ->where('start_date', '>=', $now)
            // nur Events die "heute" sichtbar sind
            ->where('booking_visible_from', '<=', $now)
            ->where('booking_visible_to', '>=', $now)
            // optional sinnvoll: abgesagte Events nicht anzeigen
            ->where('status', '!=', EventStatus::Cancelled->value)
            ->orderBy('start_date')
            ->paginate(12)
            ->through(function (Event $e) {
                $statusEnum = $e->status; // durch cast im Model bereits EventStatus
                $statusValue = $statusEnum instanceof EventStatus ? $statusEnum->value : (int) $e->status;

                return [
                    'id' => $e->id,
                    'name' => $e->name,
                    'description' => $e->description,
                    'start_date' => optional($e->start_date)->toDateTimeString(),
                    'end_date' => optional($e->end_date)->toDateTimeString(),
                    'location' => $e->location ? [
                        'id' => $e->location->id,
                        'name' => $e->location->name,
                    ] : null,
                    'status' => [
                        'value' => $statusValue,
                        'label' => ($statusEnum instanceof EventStatus) ? $statusEnum->label() : EventStatus::from($statusValue)->label(),
                    ],
                ];
            });

        return Inertia::render('Veranstaltungen/Index', [
            'category' => 'Freizeiten',
            'events' => $events,
        ]);
    }

    /**
     * Optional: Detailseite als "Buchen" Einstieg.
     * Du kannst später hier Buchungs-Flow / Checkout etc. starten.
     */
    public function show(Request $request, Event $event)
    {
        // minimaler Guard: nur zeigen, wenn es auch im Schaufenster wäre
        $now = now();

        abort_if($event->start_date < $now, 404);
        abort_if($event->booking_visible_from > $now, 404);
        abort_if($event->booking_visible_to < $now, 404);
        abort_if(((int) $event->status) === EventStatus::Cancelled->value, 404);

        $event->load(['location:id,name']);

        $statusEnum = $event->status;
        $statusValue = $statusEnum instanceof EventStatus ? $statusEnum->value : (int) $event->status;

        return Inertia::render('Veranstaltungen/Show', [
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
                    'label' => ($statusEnum instanceof EventStatus) ? $statusEnum->label() : EventStatus::from($statusValue)->label(),
                ],
            ],
        ]);
    }
}