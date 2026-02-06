<?php

namespace Database\Factories;

use App\Models\Location;
use Illuminate\Database\Eloquent\Factories\Factory;

class EventFactory extends Factory
{
    public function definition(): array
    {
        $start = $this->faker->dateTimeBetween('-30 days', '+30 days');
        $end = (clone $start)->modify('+' . $this->faker->numberBetween(1, 14) . ' days');

        return [
            'location_id' => Location::factory(),
            'name' => $this->faker->words(3, true),
            'description' => $this->faker->sentence(10),
            'start_date' => $start,
            'end_date' => $end,
        ];
    }
}
