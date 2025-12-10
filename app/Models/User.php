<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'country',
        'countryCode',
        'currencyId',
        'otp',
        'otp_expires_at',
        'image',
        'refCode',
        'refBy',
        'role',
        'is_active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed', // Add this for Laravel 10+
    ];

    public function newQuery($excludeDeleted = true)
    {
        return parent::newQuery($excludeDeleted)->withTrashed();
    }

    public function routeNotificationForFcm()
    {
        return $this->deviceDetail?->fcmToken;
    }

    public function deviceDetail()
    {
        return $this->hasOne(UserDeviceDetail::class, 'user_id');
    }
    public function kycs()
    {
        return $this->hasMany(Kyc::class);
    }
    public function topupsHistory()
    {
        return $this->hasMany(TopupHistory::class, 'user_id');
    }
    public function currency()
    {
        return $this->belongsTo(Currency::class, 'currencyId');
    }

    /**
     * Get the eSIM orders for the user.
     */
    public function esimOrders()
    {
        return $this->hasMany(EsimOrder::class);
    }
    public function payments()
    {
        return $this->hasMany(Payment::class, 'user_id');
    }

    /**
     * Check if the user is an admin.
     */
    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    /**
     * Check if the user has completed KYC.
     */
    public function hasCompletedKyc()
    {
        return $this->kycs()->where('status', 'approved')->exists();
    }

    /**
     * Get the user's latest KYC record.
     */
    public function latestKyc()
    {
        return $this->hasOne(Kyc::class)->latestOfMany();
    }
    public function pointBalance()
    {
        return $this->hasOne(UserPoint::class, 'user_id');
    }
    public function esims()
    {
        return $this->hasMany(UserEsim::class, 'user_id');
    }
    public function supportTickets()
    {
        return $this->hasMany(SupportTicket::class, 'user_id');
    }

    public function getCreatedAtAttribute($value)
    {
        $timezone = systemflag('timezone');
        return Carbon::parse($value)->timezone($timezone);
    }
    public function getUpdatedAtAttribute($value)
    {
        $timezone = systemflag('timezone');
        return Carbon::parse($value)->timezone($timezone);
    }
    public function getDeletedAtAttribute($value)
    {

        if (is_null($value)) {
            return null;
        }
        $timezone = systemflag('timezone');
        return Carbon::parse($value)->timezone($timezone);
    }
}
