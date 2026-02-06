<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Offer extends Model
{
    use HasFactory;

    public function eventOffers(): HasMany
    {
        return $this->hasMany(EventOffer::class, 'offering_id');
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'offering_id');
    }
}
