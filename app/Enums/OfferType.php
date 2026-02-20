<?php

namespace App\Enums;

enum OfferType: int
{
    case OVERNIGHT = 1;
    case SURCHARGE = 2;
    case SERVICE = 3;
    case OTHER = 4;

    public function label(): string
    {
        return match ($this) {
            self::OVERNIGHT => 'Übernachtung',
            self::SURCHARGE => 'Zuschlag',
            self::SERVICE => 'Service',
            self::OTHER => 'Sonstiges',
        };
    }

    public static function options(): array
    {
        $out = [];
        foreach (self::cases() as $case) {
            $out[$case->value] = $case->label();
        }
        return $out;
    }
}