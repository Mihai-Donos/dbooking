<?php

namespace Database\Factories;

use App\Models\Invoice;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\InvoicePosition>
 */
class InvoicePositionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'invoice_id' => Invoice::factory(),
            'type' => $this->faker->randomElement(['pauschal', 'pro nacht']),
            'label' => $this->faker->sentence(3),
            'value' => rand(23, 137)
        ];
    }
}
