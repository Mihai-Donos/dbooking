<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    /** @use HasFactory<\Database\Factories\BookingFactory> */
    use HasFactory;

    public function users()
    {
        return $this->belongsTo(User::class);
    }

    public function events()
    {
        return $this->belongsTo(Event::class);
    }

    public function offers()
    {
        return $this->belongsTo(Offer::class);
    }

    public function rooms()
    {
        return $this->belongsTo(Room::class);
    }



}
