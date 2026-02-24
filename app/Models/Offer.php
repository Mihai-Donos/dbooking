<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Enums\OfferType;
use App\Enums\OfferChargeType;

class Offer extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'type',
        'charge_type',
    ];

    protected $casts = [
        'type' => OfferType::class,
        'charge_type' => OfferChargeType::class,
        'is_host_only' => 'bool',
    ];

    public function eventOffers(): HasMany
    {
        return $this->hasMany(EventOffer::class, 'offering_id');
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'offering_id');
    }
}
