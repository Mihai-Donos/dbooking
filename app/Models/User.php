<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Enums\UserStatus;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'role',
        'status',
        'notes',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'status' => UserStatus::class,
    ];

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    public function events()
    {
        return $this->belongsToMany(\App\Models\Event::class)
            ->withPivot('visible')
            ->withTimestamps();
    }

    public function locations()
    {
        return $this->belongsToMany(\App\Models\Location::class)
            ->withPivot('visible')
            ->withTimestamps();
    }

    public function visibleLocations()
    {
        return $this->locations()->wherePivot('visible', true);
    }

    // Optional helper
    public function scopeHosts($q)
    {
        return $q->where('role', 'host');
    }

}
