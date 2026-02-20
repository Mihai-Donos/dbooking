<?php

namespace App\Enums;

enum BookingStatus: int
{
    case InReview = 0;   // In Bearbeitung (Default)
    case Confirmed = 1;  // Bestätigt
    case Cancelled = 2;  // Storniert
    case Completed = 3;  // Beendet

    public function label(): string
    {
        return match ($this) {
            self::InReview => 'In Bearbeitung',
            self::Confirmed => 'Bestätigt',
            self::Cancelled => 'Storniert',
            self::Completed => 'Beendet',
        };
    }

    public static function values(): array
    {
        return array_map(fn(self $c) => $c->value, self::cases());
    }
}