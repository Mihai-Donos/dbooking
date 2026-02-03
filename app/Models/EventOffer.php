<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EventOffer extends Model
{
    /** @use HasFactory<\Database\Factories\EventOfferFactory> */
    use HasFactory;

    public function offers()
    {
        return $this->belongsTo(Offer::class);
    }

    public function events()
    {
        return $this->belongsTo(Event::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

}
