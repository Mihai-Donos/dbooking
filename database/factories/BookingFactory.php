<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\Offer;
use App\Models\Room;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Booking>
 */
class BookingFactory extends Factory
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
            'event_id' => Event::factory(),
            'offering_id' => Offer::factory(),
            'user_id' => User::factory(),
            'room_id' => Room::factory(),
            'label' => $this->faker->firstName() . ' ' . $this->faker->lastName(),
            'from_date' => $start,
            'to_date' => $this->faker->dateTimeBetween($start, '2025-12-31'),
            'status' => 0
        ];
    }
}
