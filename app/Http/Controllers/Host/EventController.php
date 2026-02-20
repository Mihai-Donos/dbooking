<?php

namespace App\Http\Controllers\Host;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Location;
use App\Models\Offer;
use App\Enums\EventStatus;
use App\Enums\BookingStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;


class EventController extends Controller
{
    private function ensureHostOrAdmin(Request $request): void
    {
        $user = $request->user();
        abort_unless($user && in_array(($user->role ?? null), ['host', 'admin'], true), 403);
    }

    private function routeBase(Request $request): string
    {
        $name = (string) $request->route()?->getName(); // z.B. admin.events.edit
        return Str::startsWith($name, 'admin.') ? 'admin.events' : 'host.events';
    }

    private function ensureCanAccessEvent(Request $request, Event $event): void
    {
        $this->ensureHostOrAdmin($request);

        $user = $request->user();
        if (($user->role ?? null) !== 'admin') {
            abort_unless((int) $event->host_id === (int) $user->id, 403);
        }
    }

    private function statusOptions(): array
    {
        // ✅ kein EventStatus::options() mehr => kein Runtime-Error
        return array_map(fn(EventStatus $s) => [
            'value' => $s->value,
            'label' => $s->label(),
        ], EventStatus::cases());
    }

    public function index(Request $request)
    {
        $this->ensureHostOrAdmin($request);
        $user = $request->user();

        $events = Event::query()
            ->when(($user->role ?? null) !== 'admin', fn($q) => $q->where('host_id', $user->id))
            ->with(['location:id,name'])
            ->orderByDesc('start_date')
            ->get([
                'id',
                'name',
                'description',
                'start_date',
                'end_date',
                'booking_visible_from',
                'booking_visible_to',
                'status',
                'location_id',
                'host_id',
            ])
            ->map(function ($e) {
                $statusEnum = $e->status instanceof EventStatus ? $e->status : null;

                return [
                    'id' => $e->id,
                    'name' => $e->name,
                    'description' => $e->description,
                    'start_date' => optional($e->start_date)->toDateTimeString(),
                    'end_date' => optional($e->end_date)->toDateTimeString(),
                    'booking_visible_from' => optional($e->booking_visible_from)->toDateTimeString(),
                    'booking_visible_to' => optional($e->booking_visible_to)->toDateTimeString(),
                    'status' => $statusEnum?->value ?? (int) ($e->getRawOriginal('status') ?? 0),
                    'status_label' => $statusEnum?->label() ?? EventStatus::Preparation->label(),
                    'location' => $e->location ? ['id' => $e->location->id, 'name' => $e->location->name] : null,
                    'host_id' => $e->host_id,
                ];
            });

        return Inertia::render('Events/Index', [
            'routeBase' => $this->routeBase($request),
            'events' => $events,
        ]);
    }

    public function create(Request $request)
    {
        $this->ensureHostOrAdmin($request);
        $user = $request->user();

        $locations = ($user->role ?? null) === 'admin'
            ? Location::query()->orderBy('name')->get(['id', 'name'])
            : $user->visibleLocations()->orderBy('name')->get(['locations.id as id', 'locations.name as name']);

        $offers = Offer::query()
            ->orderBy('name')
            ->get()
            ->map(fn($o) => [
                'id' => $o->id,
                'name' => $o->name,
                'type_label' => $o->type?->label(),
                'charge_type_label' => $o->charge_type->label(),
            ]);

        return Inertia::render('Events/Create', [
            'routeBase' => $this->routeBase($request),
            'locations' => $locations,
            'offers' => $offers,
            'statusOptions' => $this->statusOptions(),
        ]);
    }

    public function store(Request $request)
    {
        $this->ensureHostOrAdmin($request);
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],

            'booking_visible_from' => ['required', 'date'],
            'booking_visible_to' => ['required', 'date', 'after_or_equal:booking_visible_from'],

            'status' => ['required', 'integer', Rule::in(EventStatus::values())],

            'location_id' => [
                'required',
                'integer',
                Rule::exists('locations', 'id')->when(($user->role ?? null) !== 'admin', function ($rule) use ($user) {
                    return $rule->whereIn('id', $user->visibleLocations()->pluck('locations.id'));
                }),
            ],

            // Admin darf Host auswählen; Host nicht (derzeit kein UI-Feld, bleibt kompatibel)
            'host_id' => ['nullable', 'integer', 'exists:users,id'],

            'offerings' => ['array'],
            'offerings.*.offering_id' => ['required', 'integer', 'exists:offers,id'],
            'offerings.*.price' => ['required', 'numeric', 'min:0'],
            'offerings.*.visible' => ['boolean'],
        ]);

        $hostId = ($user->role ?? null) === 'admin'
            ? (int) ($validated['host_id'] ?? $user->id)
            : (int) $user->id;

        $event = Event::create([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'booking_visible_from' => $validated['booking_visible_from'],
            'booking_visible_to' => $validated['booking_visible_to'],
            'status' => EventStatus::from((int) $validated['status']),
            'location_id' => (int) $validated['location_id'],
            'host_id' => $hostId,
        ]);

        $sync = [];
        foreach (($validated['offerings'] ?? []) as $row) {
            $id = (int) $row['offering_id'];
            $sync[$id] = [
                'price' => $row['price'],
                'visible' => (bool) ($row['visible'] ?? true),
            ];
        }
        $event->offers()->sync($sync);

        return redirect()
            ->route($this->routeBase($request) . '.index')
            ->with('success', 'Event erstellt.');
    }

    public function edit(Request $request, Event $event)
    {
        $this->ensureCanAccessEvent($request, $event);
        $user = $request->user();

        $event->load(['location:id,name', 'offers:id']);

        $locations = ($user->role ?? null) === 'admin'
            ? Location::query()->orderBy('name')->get(['id', 'name'])
            : $user->visibleLocations()->orderBy('name')->get(['locations.id as id', 'locations.name as name']);

        $offers = Offer::query()
            ->orderBy('name')
            ->get()
            ->map(fn($o) => [
                'id' => $o->id,
                'name' => $o->name,
                'type_label' => $o->type?->label(),
                'charge_type_label' => $o->charge_type->label(),
            ]);

        $selectedOfferings = $event->offers->mapWithKeys(fn($o) => [
            $o->id => [
                'selected' => true,
                'price' => (string) $o->pivot->price,
                'visible' => (bool) $o->pivot->visible,
            ],
        ]);

        $statusEnum = $event->status instanceof EventStatus ? $event->status : null;

        return Inertia::render('Events/Edit', [
            'routeBase' => $this->routeBase($request),
            'statusOptions' => $this->statusOptions(),
            'event' => [
                'id' => $event->id,
                'name' => $event->name,
                'description' => $event->description,
                'location_id' => $event->location_id,
                'start_date_local' => optional($event->start_date)->format('Y-m-d\TH:i'),
                'end_date_local' => optional($event->end_date)->format('Y-m-d\TH:i'),

                'booking_visible_from_local' => optional($event->booking_visible_from)->format('Y-m-d\TH:i'),
                'booking_visible_to_local' => optional($event->booking_visible_to)->format('Y-m-d\TH:i'),

                'status' => $statusEnum?->value ?? (int) ($event->getRawOriginal('status') ?? 0),
            ],
            'locations' => $locations,
            'offers' => $offers,
            'selectedOfferings' => $selectedOfferings,
        ]);
    }

    public function update(Request $request, Event $event)
    {
        $this->ensureCanAccessEvent($request, $event);
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],

            'booking_visible_from' => ['required', 'date'],
            'booking_visible_to' => ['required', 'date', 'after_or_equal:booking_visible_from'],

            'status' => ['required', 'integer', Rule::in(EventStatus::values())],

            'location_id' => [
                'required',
                'integer',
                Rule::exists('locations', 'id')->when(($user->role ?? null) !== 'admin', function ($rule) use ($user) {
                    return $rule->whereIn('id', $user->visibleLocations()->pluck('locations.id'));
                }),
            ],

            'offerings' => ['array'],
            'offerings.*.offering_id' => ['required', 'integer', 'exists:offers,id'],
            'offerings.*.price' => ['required', 'numeric', 'min:0'],
            'offerings.*.visible' => ['boolean'],
        ]);

        $previousStatus = $event->status instanceof EventStatus ? $event->status : EventStatus::from((int) $event->getRawOriginal('status'));

        $event->update([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'booking_visible_from' => $validated['booking_visible_from'],
            'booking_visible_to' => $validated['booking_visible_to'],
            'status' => EventStatus::from((int) $validated['status']),
            'location_id' => (int) $validated['location_id'],
        ]);


        $newStatus = EventStatus::from((int) $validated['status']);

        if ($previousStatus !== EventStatus::Finished && $newStatus === EventStatus::Finished) {
            // Alle bestätigten Buchungen auf "Beendet" setzen
            $event->bookings()
                ->where('status', BookingStatus::Confirmed->value)
                ->update(['status' => BookingStatus::Completed->value]);
        }


        $sync = [];
        foreach (($validated['offerings'] ?? []) as $row) {
            $id = (int) $row['offering_id'];
            $sync[$id] = [
                'price' => $row['price'],
                'visible' => (bool) ($row['visible'] ?? true),
            ];
        }
        $event->offers()->sync($sync);

        return redirect()
            ->route($this->routeBase($request) . '.index')
            ->with('success', 'Event gespeichert.');
    }

    public function destroy(Request $request, Event $event)
    {
        $this->ensureCanAccessEvent($request, $event);

        $event->delete();

        return redirect()
            ->route($this->routeBase($request) . '.index')
            ->with('success', 'Event gelöscht.');
    }
}