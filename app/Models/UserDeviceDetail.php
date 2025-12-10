<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserDeviceDetail extends Model
{
    use HasFactory;

    protected $table = 'user_device_details';

    protected $fillable = [
        'user_id',
        'deviceid',
        'fcmToken',
        'deviceLocation',
        'deviceManufacture',
        'deviceModel',
        'appVersion',
    ];

    /**
     * Get the user that owns the device detail.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
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
}
