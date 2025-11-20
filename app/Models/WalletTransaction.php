<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WalletTransaction extends Model
{
    use HasFactory;

    protected $fillable = ['wallet_id', 'amount', 'balance', 'status', 'description'];

    public function wallet(){
        return $this->belongsTo(UserWallet::class,'wallet_id');
    }
}
