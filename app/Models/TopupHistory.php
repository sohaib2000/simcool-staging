<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TopupHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'order_id',
        'topup_package_id',
        'iccid',
        'type',
        'description',
        'esim_type',
        'topup_title',
        'data',
        'price',
        'code',
        'currency',
        'manual_installation',
        'qrcode_installation'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
    public function package()
    {
        return $this->belongsTo(EsimPackage::class, 'topup_package_id');
    }
    public function order()
    {
        return $this->belongsTo(EsimOrder::class, 'order_id');
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
