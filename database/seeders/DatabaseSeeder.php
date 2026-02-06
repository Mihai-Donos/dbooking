<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\{Offer, User, Invoice, InvoicePosition, Event, EventOffer, Booking, Location, Room};

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1) Offers
        $offers = Offer::factory()->count(14)->create();

        // 2) Location + Rooms (garantiert 30 Rooms an dieser Location)
        $location = Location::factory()
            ->has(Room::factory()->count(30), 'rooms')
            ->create();

        // 3) Event gehört zu dieser Location
        $event = Event::factory()
            ->for($location, 'location') // setzt location_id
            ->create();

        // 4) Vier Offer-Typen auswählen
        $selectedOffers = $offers->random(4);

        // 5) EventOffers anlegen (event_id + offering_id)
        foreach ($selectedOffers as $offer) {
            EventOffer::factory()->state([
                'event_id' => $event->id,
                'offering_id' => $offer->id,
            ])->create();
        }

        // 6) Users + Invoices + Positions
        $users = User::factory()
            ->count(2)
            ->has(
                Invoice::factory()
                    ->count(3)
                    ->has(InvoicePosition::factory()->count(4), 'invoicePositions'),
                'invoices'
            )
            ->create();

        // 7) Bookings erstellen
        $offeringIds = $selectedOffers->pluck('id');
        $roomIds = $location->rooms()->pluck('id'); // ✅ sicher, weil wir Location+Rooms selbst erstellt haben

        foreach ($users as $user) {
            Booking::factory()
                ->count(3)
                ->state(fn() => [
                    'user_id' => $user->id,
                    'event_id' => $event->id,
                    'offering_id' => $offeringIds->random(),
                    'room_id' => $roomIds->isNotEmpty() ? $roomIds->random() : null, // room_id ist nullable
                ])
                ->create();
        }
    }
}
