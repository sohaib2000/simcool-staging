<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SupportTicket extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'subject', 'status'];

    public function user()
    {
        return $this->belongsTo(User::class,'user_id');
    }
    protected $appends = ['is_reply'];

    public function messages()
    {
        return $this->hasMany(SupportTicketMessage::class);
    }

    public function getIsReplyAttribute()
    {
        $lastMessage = $this->messages()->latest()->first();

        if (!$lastMessage) {
            return 1; // default assume admin replied if no messages
        }

        return $lastMessage->sender_type === 'user' ? 0 : 1;
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
