<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    /** @use HasFactory<\Database\Factories\EventFactory> */
    use HasFactory;

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function eventOffers()
    {
        return $this->hasMany(EventOffer::class);
    }

    public function locations()
    {
        return $this->belongsTo(Location::class);
    }

}
