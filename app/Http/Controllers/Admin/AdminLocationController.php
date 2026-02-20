<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AdminLocationController extends Controller
{
    private function ensureAdmin(Request $request): void
    {
        $user = $request->user();
        abort_unless($user && ($user->role ?? null) === 'admin', 403);
    }

    public function index(Request $request)
    {
        $this->ensureAdmin($request);

        $locations = Location::query()
            ->withCount('rooms')
            ->withSum('rooms as capacity_sum', 'capacity')
            ->orderBy('name')
            ->get(['id', 'name', 'description', 'created_at']);

        return Inertia::render('Admin/Locations/Index', [
            'locations' => $locations,
        ]);
    }

    public function create(Request $request)
    {
        $this->ensureAdmin($request);

        return Inertia::render('Admin/Locations/Add');
    }

    public function store(Request $request)
    {
        $this->ensureAdmin($request);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],

            'rooms' => ['array'],
            'rooms.*.number' => ['nullable', 'integer', 'min:1', 'max:32767', 'distinct'], // verhindert doppelt im Formular
            'rooms.*.capacity' => ['nullable', 'integer', 'min:1', 'max:50'],
            'rooms.*.description' => ['nullable', 'string'],
        ]);

        DB::transaction(function () use ($data) {
            $location = Location::create([
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
            ]);

            $rooms = collect($data['rooms'] ?? [])
                ->filter(fn($r) => !empty($r['number'])) // nur Zeilen mit Nummer
                ->map(function ($r) {
                    return [
                        'number' => (int) $r['number'],
                        'capacity' => isset($r['capacity']) ? (int) $r['capacity'] : 1,
                        'description' => $r['description'] ?? null,
                    ];
                })
                ->values()
                ->all();

            if (!empty($rooms)) {
                $location->rooms()->createMany($rooms);
            }
        });

        return redirect()
            ->route('admin.locations.index')
            ->with('success', 'Location inkl. Zimmer wurde angelegt.');
    }

    public function edit(Request $request, Location $location)
    {
        $this->ensureAdmin($request);

        $location->load(['rooms' => fn($q) => $q->orderBy('number')]);

        return Inertia::render('Admin/Locations/Edit', [
            'location' => [
                'id' => $location->id,
                'name' => $location->name,
                'description' => $location->description,
            ],
            'rooms' => $location->rooms->map(fn($r) => [
                'id' => $r->id,
                'number' => $r->number,
                'capacity' => $r->capacity,
                'description' => $r->description,
            ])->values(),
        ]);
    }


    public function update(Request $request, Location $location)
    {
        $this->ensureAdmin($request);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],

            'rooms' => ['array'],
            'rooms.*.id' => ['nullable', 'integer', 'exists:rooms,id'],
            'rooms.*.number' => ['required', 'integer', 'min:1', 'max:32767', 'distinct'],
            'rooms.*.capacity' => ['nullable', 'integer', 'min:1', 'max:50'],
            'rooms.*.description' => ['nullable', 'string'],

            'deleted_room_ids' => ['array'],
            'deleted_room_ids.*' => ['integer', 'exists:rooms,id'],
        ]);

        $deletedIds = collect($data['deleted_room_ids'] ?? [])
            ->map(fn($v) => (int) $v)
            ->unique()
            ->values()
            ->all();

        DB::beginTransaction();

        try {
            $location->update([
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
            ]);

            // Rooms updaten / anlegen
            foreach (($data['rooms'] ?? []) as $row) {
                $payload = [
                    'number' => (int) $row['number'],
                    'capacity' => isset($row['capacity']) ? (int) $row['capacity'] : 1,
                    'description' => $row['description'] ?? null,
                ];

                if (!empty($row['id'])) {
                    $room = $location->rooms()->whereKey((int) $row['id'])->first();
                    if (!$room) {
                        throw ValidationException::withMessages([
                            'rooms' => ['Ein Zimmer gehört nicht zu dieser Location (Sicherheitscheck).'],
                        ]);
                    }
                    $room->update($payload);
                } else {
                    $location->rooms()->create($payload);
                }
            }

            // Rooms löschen (nur wenn keine Bookings)
            if (!empty($deletedIds)) {
                $roomsToDelete = $location->rooms()->whereIn('id', $deletedIds)->get();

                foreach ($roomsToDelete as $r) {
                    if ($r->bookings()->exists()) {
                        throw ValidationException::withMessages([
                            'deleted_room_ids' => ["Zimmer {$r->number} kann nicht gelöscht werden (Buchungen vorhanden)."],
                        ]);
                    }
                }

                $location->rooms()->whereIn('id', $deletedIds)->delete();
            }

            DB::commit();
        } catch (QueryException $e) {
            DB::rollBack();

            // Unique violation (z.B. gleiche Zimmernummer pro Location)
            if (str_contains($e->getMessage(), 'rooms_location_id_number_unique')) {
                throw ValidationException::withMessages([
                    'rooms' => ['Zimmernummern müssen pro Location eindeutig sein.'],
                ]);
            }

            throw $e;
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }

        return redirect()
            ->route('admin.locations.edit', $location->id)
            ->with('success', 'Location/Zimmer wurden aktualisiert.');
    }

}