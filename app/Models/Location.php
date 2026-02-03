<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Location extends Model
{
    /** @use HasFactory<\Database\Factories\LocationFactory> */
    use HasFactory;

    public function events()
    {
        return $this->hasMany(Event::class);
    }

    public function rooms()
    {
        return $this->hasMany(Room::class);
    }
}
