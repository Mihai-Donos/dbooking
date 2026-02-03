<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\Location;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Event>
 */
class EventFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $start = $this->faker->dateTime();

        return [
            'location_id' => Location::factory(),
            'event_id' => Event::factory(),
            'name' => $this->faker->title,
            'description' => $this->faker->sentence(5),
            'start_date' => $start,
            'end_date' => $this->faker->dateTimeBetween($start, '2025-12-31')
        ];
    }
}
