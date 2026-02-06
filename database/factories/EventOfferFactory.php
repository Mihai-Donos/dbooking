<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\Offer;
use Illuminate\Database\Eloquent\Factories\Factory;

class EventOfferFactory extends Factory
{
    public function definition(): array
    {
        return [
            'event_id' => Event::factory(),
            'offering_id' => Offer::factory(),  // ✅ nicht "id"
            'price' => $this->faker->randomFloat(2, 10, 250),
            'visible' => true,
        ];
    }
}
