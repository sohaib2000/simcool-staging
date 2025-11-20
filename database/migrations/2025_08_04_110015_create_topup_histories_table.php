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
        Schema::create('topup_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->bigInteger('order_id')->unsigned();
            $table->string('topup_package_id',100);
            $table->string('iccid',100)->nullable();
            $table->string('type',50)->nullable();
            $table->text('description')->nullable();
            $table->string('esim_type',30)->nullable();
            $table->string('topup_title',50)->nullable();
            $table->string('data',30)->nullable();
            $table->double('price',10,2)->default('00.00');
            $table->string('code',100)->nullable();
            $table->string('currency',50)->nullable();
            $table->text('manual_installation')->nullable();
            $table->text('qrcode_installation')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('topup_histories');
    }
};
