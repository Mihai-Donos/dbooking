<?php

namespace App\Enums;

enum BookingBulkAction: string
{
    case StatusInReview = 'status_in_review';
    case StatusConfirmed = 'status_confirmed';
    case StatusCancelled = 'status_cancelled';

    case ResetRoom = 'reset_room';
    case Delete = 'delete';

    // optional, erstmal nur als Platzhalter
    case ExportCsv = 'export_csv';

    public function label(): string
    {
        return match ($this) {
            self::StatusInReview => 'Status: In Bearbeitung',
            self::StatusConfirmed => 'Status: Bestätigt',
            self::StatusCancelled => 'Status: Storniert',
            self::ResetRoom => 'Zimmerzuweisung zurücksetzen',
            self::Delete => 'Ausgewählte löschen',
            self::ExportCsv => 'Export als CSV',
        };
    }
}