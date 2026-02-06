<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class RoomFactory extends Factory
{
    public function definition(): array
    {
        static $roomNumber = 100;
        $capacity = $this->faker->numberBetween(1, 5);

        return [
            // ❌ NICHT location_id hier setzen!
            'number' => $roomNumber++,
            'capacity' => $capacity,
            'description' => $capacity > 1 ? 'Mehrbettzimmer' : 'Einzelzimmer',
        ];
    }
}
