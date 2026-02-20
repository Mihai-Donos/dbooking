<?php

namespace App\Enums;

enum UserStatus: int
{
    case New = 0;
    case Confirmed = 1;
    case Blocked = 2;

    public function label(): string
    {
        return match ($this) {
            self::New => 'New',
            self::Confirmed => 'Confirmed',
            self::Blocked => 'Blocked',
        };
    }
}