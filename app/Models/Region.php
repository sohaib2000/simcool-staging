<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Region extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'slug', 'image', 'is_active','code'];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function countries()
    {
        return $this->hasMany(Country::class, 'region_id', 'id');
    }
    public function packages()
    {
        return $this->hasMany(EsimPackage::class, 'region_id');
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
