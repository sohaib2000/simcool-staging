<?php

namespace App\Models;

use App\Services\AiraloService;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserEsim extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'order_id',
        'package_id',
        'iccid',
        'imsis',
        'msisdn',
        'matching_id',
        'qrcode',
        'qrcode_url',
        'airalo_code',
        'apn_type',
        'apn_value',
        'is_roaming',
        'confirmation_code',
        'apn',
        'direct_apple_installation_url',
        'status',
        'remaining',
        'activated_at',
        'expired_at',
        'activation_notified',
        'finished_at'
    ];

    protected $casts = [
        'apn' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
    public function order()
    {
        return $this->belongsTo(EsimOrder::class, 'order_id');
    }
    public function package()
    {
        return $this->belongsTo(EsimPackage::class, 'package_id');
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
    public function getActivatedAtAttribute($value)
    {
        if (is_null($value)) {
            return null;
        }
        $timezone = systemflag('timezone');
        return Carbon::parse($value)->timezone($timezone);
    }
    public function getExpiredAtAttribute($value)
    {
        if (is_null($value)) {
            return null;
        }
        $timezone = systemflag('timezone');
        return Carbon::parse($value)->timezone($timezone);
    }
    public function getFinishedAtAttribute($value)
    {

        if (is_null($value)) {
            return null;
        }
        $timezone = systemflag('timezone');
        return Carbon::parse($value)->timezone($timezone);
    }
}
