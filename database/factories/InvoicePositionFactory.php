<?php

namespace Database\Factories;

use App\Models\Invoice;
use Illuminate\Database\Eloquent\Factories\Factory;

class InvoicePositionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'invoice_id' => Invoice::factory(),
            'type' => $this->faker->randomElement(['pauschal', 'pro nacht']),
            'label' => $this->faker->sentence(3),
            'value' => $this->faker->randomFloat(2, 23, 137),
        ];
    }
}
