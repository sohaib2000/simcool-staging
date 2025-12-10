<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InAppProduct extends Model
{
    use HasFactory;

    protected $fillable = [
        'currency_id',
        'name',
        'sku',
        'min_price',
        'max_price',
        'set_price',
        'isActive',
        'ios_review_image',
        'isAndroidUpload',
        'isAppleUpload',
    ];

    protected $casts = [
        'isActive' => 'boolean',
        'isAndroidUpload' => 'boolean',
        'isAppleUpload' => 'boolean',
        'min_price' => 'float',
        'max_price' => 'float',
        'set_price' => 'float',
        'currency_id' => 'integer',
    ];
    public function currency()
    {
        return $this->belongsTo(Currency::class,'currency_id');
    }
}
