<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class OfferFactory extends Factory
{
    public function definition(): array
    {
        $names = [
            '0-1 Baby',
            '2-5 Kleinkind',
            '6-12 Kind',
            '13-17 Teen',
            '18+ Erwachsener',
            'Hund',
            'Zusätz. Frühstück',
            'Zusätz. Mittagessen',
            'Zusätzl. Abendessen',
            'Zuschlag EZ',
            'Zuschlag Bettwäsche',
            'Zuschlag 1-Übernachtung',
            'Zuschlag 2-Übernachtung',
        ];

        static $i = 0;
        $name = $names[$i % count($names)];
        $i++;

        return [
            'name' => $name,
            'description' => $this->faker->sentence(),
            'type' => $this->faker->numberBetween(1, 3),
            'charge_type' => $this->faker->numberBetween(0, 1),
        ];
    }
}
