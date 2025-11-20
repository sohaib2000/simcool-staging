<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PointTransaction extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'from_user_id', 'point', 'balance', 'status', 'description'];

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
