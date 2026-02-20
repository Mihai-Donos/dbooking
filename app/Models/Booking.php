<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Enums\BookingStatus;
use App\Models\Room;

class Booking extends Model
{
    protected $fillable = [
        'from_date',
        'to_date',
        'nights',
        'total_amount',
        'status',
        'room_id',

        'glutenfree',
        'vegetarian',
        'lactose_free',
        'single_room',
        'baby_bed',

        'event_id',
        'user_id',
        'customer_name',
    ];

    protected $casts = [
        'from_date' => 'datetime',
        'to_date' => 'datetime',
        'total_amount' => 'decimal:2',

        'status' => BookingStatus::class,
        'room_id' => 'integer',

        'glutenfree' => 'boolean',
        'vegetarian' => 'boolean',
        'lactose_free' => 'boolean',
        'single_room' => 'boolean',
        'baby_bed' => 'boolean',
        'customer_name' => 'string',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(BookingItem::class);
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }
}