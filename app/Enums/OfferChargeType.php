<?php

namespace App\Enums;

enum OfferChargeType: int
{
    case PER_BOOKING = 1;
    case PER_DAY = 2;

    public function label(): string
    {
        return match ($this) {
            self::PER_BOOKING => 'Einmalig pro Buchung',
            self::PER_DAY => 'Pro Buchungstag',
        };
    }

    public static function options(): array
    {
        // Für Form-Selects (value => label)
        return array_reduce(self::cases(), function ($carry, $case) {
            $carry[$case->value] = $case->label();
            return $carry;
        }, []);
    }
}