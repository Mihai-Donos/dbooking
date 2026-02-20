<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Offer;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use App\Enums\OfferType;
use App\Enums\OfferChargeType;

class AdminOfferController extends Controller
{
    private function ensureAdmin(Request $request): void
    {
        $user = $request->user();
        abort_unless($user && ($user->role ?? null) === 'admin', 403);
    }

    public function index(Request $request)
    {
        $this->ensureAdmin($request);

        $offers = Offer::query()
            ->orderBy('name')
            ->get(['id', 'name', 'description', 'type', 'charge_type', 'created_at'])
            ->map(function (Offer $o) {
                return [
                    'id' => $o->id,
                    'name' => $o->name,
                    'description' => $o->description,

                    // Werte (für Logik/Forms)
                    'type' => $o->type?->value,
                    'charge_type' => $o->charge_type?->value,

                    // Labels (für Anzeige/Suche)
                    'type_label' => $o->type?->label(),
                    'charge_type_label' => $o->charge_type?->label(),

                    'created_at' => $o->created_at,
                ];
            });

        return Inertia::render('Admin/Offers/Index', [
            'offers' => $offers,
        ]);
    }

    public function create(Request $request)
    {
        $this->ensureAdmin($request);

        return Inertia::render('Admin/Offers/Add', [
            'typeOptions' => OfferType::options(),
            'chargeTypeOptions' => OfferChargeType::options(),
        ]);
    }

    public function store(Request $request)
    {
        $this->ensureAdmin($request);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'type' => ['nullable', 'integer', 'min:-32768', 'max:32767'],
            'charge_type' => ['required', Rule::in(array_map(fn($c) => $c->value, OfferChargeType::cases()))]
        ]);

        Offer::create([
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'type' => $data['type'] ?? null,
            'charge_type' => $data['charge_type'],
        ]);

        return redirect()
            ->route('admin.offers.index')
            ->with('success', 'Offer wurde angelegt.');
    }

    public function edit(Request $request, Offer $offer)
    {
        $this->ensureAdmin($request);

        $type = $offer->type;
        $charge = $offer->charge_type;

        return Inertia::render('Admin/Offers/Edit', [
            'offer' => [
                'id' => $offer->id,
                'name' => $offer->name,
                'description' => $offer->description,
                'type' => $type instanceof \BackedEnum ? $type->value : $type,
                'charge_type' => $charge instanceof \BackedEnum ? $charge->value : $charge,
            ],
            'typeOptions' => OfferType::options(),
            'chargeTypeOptions' => OfferChargeType::options(),
        ]);
    }

    public function update(Request $request, Offer $offer)
    {
        $this->ensureAdmin($request);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'type' => ['nullable', 'integer', 'min:-32768', 'max:32767'],
            'charge_type' => ['required', 'integer', 'min:-32768', 'max:32767'],
        ]);

        $offer->update([
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'type' => $data['type'] ?? null,
            'charge_type' => $data['charge_type'],
        ]);

        return redirect()
            ->route('admin.offers.edit', $offer->id)
            ->with('success', 'Offer wurde aktualisiert.');
    }

    public function destroy(Request $request, Offer $offer)
    {
        $this->ensureAdmin($request);

        $offer->delete();

        return redirect()
            ->route('admin.offers.index')
            ->with('success', 'Offer wurde gelöscht.');
    }
}