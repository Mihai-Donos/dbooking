<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

use App\Models\Offer;
use App\Models\User;
use App\Models\Invoice;
use App\Models\InvoicePosition;
use App\Models\Event;
use App\Models\EventOffer;
use App\Models\Booking;
use App\Models\Location;
use App\Models\Room;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        /**
         * 1) Allgemeine Offers anlegen
         */
        $offers = Offer::factory()
            ->count(14)
            ->create();

        /**
         * 2) Event + Location + Rooms anlegen
         *
         * Annahmen:
         * - Event hat relation: location()
         * - Location hat relation: rooms()
         */
        $event = Event::factory()
            ->has(
                Location::factory()
                    ->count(1)
                    ->has(Room::factory()->count(30), 'rooms'),
                'location'
            )
            ->create();

        /**
         * 3) EventOffers anlegen und mit bestehenden Offers verknüpfen
         *
         * Annahmen:
         * - EventOffer gehört zu Event über relation: event()
         * - EventOffer gehört zu Offer über relation: offer()
         * - Event hat relation: eventOffers()
         */
        $selectedOffers = $offers->random(4);

        foreach ($selectedOffers as $offer) {
            EventOffer::factory()
                ->for($event, 'event')
                ->for($offer, 'offer')
                ->create();
        }

        // IDs einmalig holen (performant)
        $eventOfferIds = $event->eventOffers()->pluck('id');

        /**
         * 4) Users + Invoices + InvoicePositions anlegen
         *
         * Annahmen:
         * - User hat relation: invoices()
         * - Invoice hat relation: invoicePositions()
         */
        $users = User::factory()
            ->count(2)
            ->has(
                Invoice::factory()
                    ->count(3)
                    ->has(InvoicePosition::factory()->count(4), 'invoicePositions'),
                'invoices'
            )
            ->create();

        /**
         * 5) Pro User: 3 Bookings, jeweils für das Event + zufälliges EventOffer
         *
         * Annahmen:
         * - Booking gehört zu User über relation: user()
         * - Booking gehört zu Event über relation: event()
         * - Booking hat FK event_offer_id (oder relation eventOffer())
         */
        foreach ($users as $user) {
            Booking::factory()
                ->count(3)
                ->for($user, 'user')
                ->for($event, 'event')
                ->state(fn() => [
                    'event_offer_id' => $eventOfferIds->random(),
                ])
                ->create();
        }
    }
}
