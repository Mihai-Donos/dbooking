<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class InvoiceFactory extends Factory
{
    public function definition(): array
    {
        $status = $this->faker->randomElement(['temporär', 'offen', 'bezahlt']);
        $charged = $this->faker->numberBetween(100, 2344);

        return [
            'user_id' => User::factory(),
            'number' => $this->faker->numberBetween(10000, 99999),
            'status' => $status,
            'amount_charged' => $charged,
            'amount_payed' => $status === 'bezahlt' ? $charged : 0,
        ];
    }
}
