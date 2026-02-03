<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\Offer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\EventOffer>
 */
class EventOfferFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'event_id' => Event::factory(),
            'offering_id' => Offer::factory(),
            'price' => $this->faker->randomDigitNotNull(),
            'visible' => 1
        ];
    }
}
