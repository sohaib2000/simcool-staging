<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class EsimPackage extends Model
{
    use HasFactory;

    protected $table = 'esim_packages';

    protected $fillable = [
        'package_id',
        'country_ids',
        'region_id',
        'name',
        'type',
        'price',
        'amount',
        'day',
        'is_unlimited',
        'short_info',
        'qr_installation',
        'manual_installation',
        'is_fair_usage_policy',
        'fair_usage_policy',
        'data',
        'net_price',
        'prices',
        'is_active',
        'is_popular',
        'is_recommend',
        'is_best_value',
        'airalo_active',
        'esim_provider',
        'location',
        'country',
        'speed',
        'locationCode'
    ];

    protected $casts = [
        'is_unlimited' => 'boolean',
        'is_fair_usage_policy' => 'boolean',
        'is_active' => 'boolean',
        'is_recommend' => 'boolean',
        'is_best_value' => 'boolean',
        'is_popular' => 'boolean',
        'prices' => 'array',
    ];

    public function operator()
    {
        return $this->hasMany(Operator::class,'esim_id');
    }

    public function banners()
    {
        return $this->hasMany(Banner::class, 'package_id');
    }

    public function esims()
    {
        return $this->hasMany(UserEsim::class, 'package_id');
    }
    public function orders()
    {
        return $this->hasMany(EsimOrder::class, 'esim_package_id');
    }
    public function region()
    {
        return $this->belongsTo(Region::class, 'region_id');
    }

    public function topups()
    {
        return $this->hasMany(TopupHistory::class, 'topup_package_id','package_id');
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
