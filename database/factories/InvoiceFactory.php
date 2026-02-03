<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Invoice>
 */
class InvoiceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $invoice_status = $this->faker->randomElement(['temporär', 'offen', 'bezahlt']);
        $invoice_charged = rand(100, 2344);

        return [
            'user_id' => User::factory(),
            'number' => rand(1000, 10000),
            'status' => $invoice_status,
            'amount_charged' => $invoice_charged,
            'amount_payed' => $invoice_status == 'bezahlt' ? $invoice_charged : 0
        ];
    }
}
