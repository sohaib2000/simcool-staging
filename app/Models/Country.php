<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class Country extends Model
{
    protected $fillable = [
        'region_id',
        'name',
        'slug',
        'country_code',
        'image',
        'is_active'
    ];
    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function operators()
    {
        return $this->hasMany(Operator::class, 'country_id');
    }
    public function region()
    {
        return $this->belongsTo(Region::class, 'region_id', 'id');
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
