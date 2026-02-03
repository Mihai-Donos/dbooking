<?php

namespace Database\Factories;

use App\Models\Location;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Room>
 */
class RoomFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {

        static $room_number = 100;
        $capacity = $this->faker->numberBetween(1, 5);

        return [
            'location_id' => Location::factory(),
            'number' => $room_number++,
            'capacity' => $capacity,
            'descriptions' => $capacity > 1 ? 'Mehrbettzimmer' : 'Einzelzimmer'
        ];
    }
}
