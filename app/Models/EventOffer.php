<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventOffer extends Model
{
    use HasFactory;

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    // event_offers.offering_id -> offers.id
    public function offer(): BelongsTo
    {
        return $this->belongsTo(Offer::class, 'offering_id');
    }
}
