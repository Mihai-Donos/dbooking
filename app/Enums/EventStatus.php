<?php

namespace App\Enums;

enum EventStatus: int
{
    case Preparation = 0;        // In Vorbereitung
    case RegistrationOpen = 1;   // Anmeldung möglich
    case RegistrationClosed = 2; // Anmeldung beendet
    case InProgress = 3;         // Im Gange
    case Finished = 4;           // Beendet
    case Cancelled = 5;          // Abgesagt

    public function label(): string
    {
        return match ($this) {
            self::Preparation => 'In Vorbereitung',
            self::RegistrationOpen => 'Anmeldung möglich',
            self::RegistrationClosed => 'Anmeldung beendet',
            self::InProgress => 'Im Gange',
            self::Finished => 'Beendet',
            self::Cancelled => 'Abgesagt',
        };
    }

    /** Für Validation (Rule::in) */
    public static function values(): array
    {
        return array_map(fn(self $c) => $c->value, self::cases());
    }
}