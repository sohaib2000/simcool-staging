<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Systemflag extends Model
{
    use HasFactory;

    protected $fillable = [
        'flagGroupId',
        'parent_id',
        'valueType',
        'name',
        'value',
        'isActive',
        'isDelete',
        'displayName',
        'description',
        'viewenable',
    ];

    protected $casts = [
        'isActive' => 'boolean',
        'isDelete' => 'boolean',
        'viewenable' => 'boolean',
    ];

    /**
     * Relationship: Flag Group
     */
    public function flagGroup()
    {
        return $this->belongsTo(Flaggroup::class, 'flagGroupId');
    }

    /**
     * Relationship: Parent Flag (Self-referencing)
     */
    public function parent()
    {
        return $this->belongsTo(Systemflag::class, 'parent_id');
    }

    /**
     * Relationship: Child Flags (Self-referencing)
     */
    public function children()
    {
        return $this->hasMany(Systemflag::class, 'parent_id');
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
