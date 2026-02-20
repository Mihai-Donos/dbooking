<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Location;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class HostLocationVisibilityController extends Controller
{
    private function ensureAdmin(Request $request): void
    {
        $user = $request->user();
        abort_unless($user && ($user->role ?? null) === 'admin', 403);
    }

    public function index(Request $request)
    {
        $this->ensureAdmin($request);

        $hosts = User::query()
            ->where('role', 'host')
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        $locations = Location::query()
            ->orderBy('name')
            ->get(['id', 'name', 'description']);

        $selectedHostId = (int) ($request->query('host_id') ?? ($hosts->first()->id ?? 0));

        $assignedLocationIds = [];
        if ($selectedHostId) {
            $host = User::query()
                ->where('role', 'host')
                ->findOrFail($selectedHostId);

            // Nur "sichtbar" = true gilt als freigeschaltet
            $assignedLocationIds = $host->locations()
                ->wherePivot('visible', true)
                ->pluck('locations.id')
                ->map(fn($v) => (int) $v)
                ->all();
        }

        return Inertia::render('Admin/Locations/Assign', [
            'hosts' => $hosts,
            'locations' => $locations,
            'selectedHostId' => $selectedHostId,
            'assignedLocationIds' => $assignedLocationIds,
        ]);
    }

    public function update(Request $request)
    {
        $this->ensureAdmin($request);

        $validated = $request->validate([
            'host_id' => ['required', 'integer', 'exists:users,id'],
            'location_ids' => ['array'],
            'location_ids.*' => ['integer', 'exists:locations,id'],
        ]);

        $hostId = (int) $validated['host_id'];

        // Sicherheitsregel: Admin kann nur für Hosts zuweisen
        $host = User::query()
            ->where('role', 'host')
            ->findOrFail($hostId);

        $selected = collect($validated['location_ids'] ?? [])
            ->map(fn($v) => (int) $v)
            ->unique()
            ->values()
            ->all();

        DB::transaction(function () use ($host, $selected) {
            // 1) Alle ausgewählten auf visible=true setzen (und neue ggf. anlegen)
            $payload = [];
            foreach ($selected as $locationId) {
                $payload[$locationId] = ['visible' => true];
            }

            // syncWithoutDetaching:
            // - legt neue Pivot-Reihen an
            // - aktualisiert Pivot-Attribute bei bestehenden
            // - entfernt nichts
            $host->locations()->syncWithoutDetaching($payload);

            // 2) Alles, was NICHT ausgewählt ist, auf visible=false setzen (statt detachen)
            $pivot = $host->locations()->newPivotStatement()
                ->where('user_id', $host->id);

            if (count($selected) > 0) {
                $pivot->whereNotIn('location_id', $selected);
            }

            $pivot->update(['visible' => false]);
        });

        return redirect()
            ->route('admin.locations.assign', ['host_id' => $hostId])
            ->with('success', 'Locations wurden aktualisiert.');
    }
}