<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserWallet extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'balance', 'is_active'];

    public function walletTransactions()
    {
        return $this->hasMany(WalletTransaction::class, 'wallet_id');
    }
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
