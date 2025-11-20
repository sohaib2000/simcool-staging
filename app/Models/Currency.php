<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class Currency extends Model
{
    protected $fillable = ['name','symbol','is_active','referral_point','usd_conversion'];

     public function user()
    {
        return $this->hasMany(User::class,'currencyId');
    }
     public function order()
    {
        return $this->hasMany(EsimOrder::class,'currency_id');
    }
     public function payment()
    {
        return $this->hasMany(Payment::class,'currency_id');
    }
     public function inAppProducts()
    {
        return $this->hasMany(InAppProduct::class,'currency_id');
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
