<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'order_id',
        'currency_id',
        'gateway_order_id',
        'payment_id',
        'payment_mode',
        'payment_for',
        'payment_ref',
        'amount',
        'payment_status',
        'gateway',
    ];

    /**
     * Relationships
     */

    // Payment belongs to a user
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Payment belongs to an eSIM order
    public function order()
    {
        return $this->belongsTo(EsimOrder::class, 'order_id');
    }

    // Payment belongs to a currency
    public function currency()
    {
        return $this->belongsTo(Currency::class);
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
