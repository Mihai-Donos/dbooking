<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Offer>
 */
class OfferFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $offer_name = array('0-1 Baby', '2-5 Kleinkind', '6-12 Kind', '13-17 Teen', '18+ Erwachsener', 'Hund', 'Zusätz. Frühstück', 'Zusätz. Mittagessen', 'Zusätzl. Abendessen', 'Zuschlag EZ', 'Zuschlag Bettwäsche', 'Zuschlag 1-Übernachtung', 'Zuschlag 2-Übernachtung');
        static $offer_count = 0;

        $offer_count = $offer_count == count($offer_name) ? $offer_count = 0 : $offer_count;

        return [
            'name' => $offer_name[$offer_count],
            'description' => $this->faker->sentence(),
            'type' => $this->faker->numberBetween(1, 3),
            'chrage_type' => $this->faker->randomElement(['pauschal', 'pro nacht'])
        ];
    }
}
