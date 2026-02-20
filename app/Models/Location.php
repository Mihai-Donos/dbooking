<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Location extends Model
{
    use HasFactory;
    protected $fillable = ['name', 'description'];

    public function events(): HasMany
    {
        return $this->hasMany(Event::class);
    }

    public function rooms(): HasMany
    {
        return $this->hasMany(Room::class);
    }

    public function users()
    {
        return $this->belongsToMany(\App\Models\User::class)
            ->withPivot('visible')
            ->withTimestamps();
    }

    public function scopeVisibleFor($query, \App\Models\User $user)
    {
        return $query->whereHas('users', function ($q) use ($user) {
            $q->where('users.id', $user->id)
                ->where('location_user.visible', true);
        });
    }


    // Summary of hosts

    public function hosts(): BelongsToMany
    {
        // Standard: location_user
        return $this->belongsToMany(User::class)
            ->withPivot('visible')
            ->withTimestamps();
    }

}
