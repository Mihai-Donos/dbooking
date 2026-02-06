<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class BookingFactory extends Factory
{
    public function definition(): array
    {
        $from = $this->faker->dateTimeBetween('-10 days', '+30 days');
        $to = (clone $from)->modify('+' . $this->faker->numberBetween(1, 14) . ' days');

        return [
            'label' => $this->faker->firstName() . ';' . $this->faker->lastName(),
            'from_date' => $from,
            'to_date' => $to,
            'glutenfree' => $this->faker->boolean(10),
            'vegetarian' => $this->faker->boolean(10),
            'lactose_free' => $this->faker->boolean(10),
            'single_room' => $this->faker->boolean(20),
            'baby_bed' => $this->faker->boolean(10),
            // FKs setze ich im Seeder per state()
        ];
    }
}
