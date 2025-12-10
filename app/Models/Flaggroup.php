<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Flaggroup extends Model
{
    use HasFactory;

    protected $fillable = [
        'flagGroupName',
        'parentFlagGroupId',
        'displayOrder',
        'isActive',
        'isDelete',
        'description',
        'viewenable',
    ];

    protected $casts = [
        'isActive' => 'boolean',
        'isDelete' => 'boolean',
        'viewenable' => 'boolean',
    ];

    /**
     * Relationship: Systemflags in this group
     */
    public function systemFlag()
    {
        return $this->hasMany(Systemflag::class, 'flagGroupId');
    }

    /**
     * Optional: Relationship to parent group (if using self-reference)
     */
    public function parentGroup()
    {
        return $this->belongsTo(Flaggroup::class, 'parentFlagGroupId');
    }

    /**
     * Optional: Relationship to child groups (if using self-reference)
     */
    public function subGroup()
    {
        return $this->hasMany(Flaggroup::class, 'parentFlagGroupId');
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
