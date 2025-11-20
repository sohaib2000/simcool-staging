<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Kyc extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'full_name',
        'dob',
        'address',
        'identity_card',
        'pancard',
        'photo',
        'status',
        'admin_note',
        'identity_card_no'
    ];

    public function user()
    {
        return $this->belongsTo(User::class,'user_id');
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
