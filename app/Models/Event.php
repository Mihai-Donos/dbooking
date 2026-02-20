<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use App\Models\Offer;
use App\Enums\EventStatus;


class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'start_date',
        'end_date',
        'location_id',
        'host_id',
        'status',
        'booking_visible_from',
        'booking_visible_to',
        'requires_room_assignment',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'booking_visible_from' => 'datetime',
        'booking_visible_to' => 'datetime',
        'status' => EventStatus::class,
        'requires_room_assignment' => 'boolean',
    ];

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function eventOffers(): HasMany
    {
        return $this->hasMany(EventOffer::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function host(): BelongsTo
    {
        return $this->belongsTo(User::class, 'host_id');
    }

    // Wenn du dieses Pivot wirklich NUR für Hosts nutzt, passt das.
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class)
            ->withPivot('visible')
            ->withTimestamps();
    }

    public function scopeVisibleFor($query, User $user)
    {
        return $query->whereHas('users', function ($q) use ($user) {
            $q->where('users.id', $user->id)
                ->where('event_user.visible', true);
        });
    }

    // Offers, angebunden über event_offers.offering_id
    public function offers(): BelongsToMany
    {
        return $this->belongsToMany(Offer::class, 'event_offers', 'event_id', 'offering_id')
            ->withPivot(['price', 'visible'])
            ->withTimestamps();
    }

}