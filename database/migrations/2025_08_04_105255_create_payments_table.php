<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('order_id')->constrained('esim_orders');
            $table->foreignId('currency_id')->constrained('currencies');
            $table->string('gateway_order_id')->nullable();
            $table->string('payment_id')->nullable();
            $table->string('payment_mode',50)->nullable();
            $table->string('payment_for',50)->nullable();
            $table->text('payment_ref')->nullable();
            $table->double('amount',10,2)->default('0.00');
            $table->string('payment_status',50)->default('pending');
            $table->text('gateway')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
