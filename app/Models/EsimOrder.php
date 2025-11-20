<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EsimOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'esim_package_id',
        'currency_id',
        'provider_price',
        'order_ref',
        'status',
        'activation_details',
        'user_note',
        'total_amount',
        'webhook_request_id',
        'admin_note'
    ];

    protected $casts = [
        'activation_details' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function currency()
    {
        return $this->belongsTo(Currency::class,'currency_id');
    }

    public function package()
    {
        return $this->belongsTo(EsimPackage::class, 'esim_package_id');
    }
    public function esims()
    {
        return $this->hasOne(UserEsim::class,'order_id');
    }
    public function payment()
    {
        return $this->hasOne(Payment::class,'order_id');
    }

    public function topup()
    {
        return $this->hasOne(TopupHistory::class,'order_id');
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
