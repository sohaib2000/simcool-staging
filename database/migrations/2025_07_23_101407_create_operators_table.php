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
        Schema::create('operators', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->bigInteger('esim_id')->default(0);
            $table->unsignedBigInteger('airaloOperatorId')->default(0);
            $table->string('type')->nullable();
            $table->boolean('is_prepaid')->default(false);
            $table->string('esim_type', 50)->nullable();
            $table->string('apn_type', 50)->nullable();
            $table->string('apn_value', 50)->nullable();
            $table->text('info')->nullable();
            $table->string('image')->nullable();
            $table->string('plan_type', 50)->nullable();
            $table->string('activation_policy', 50)->nullable();
            $table->boolean('is_kyc_verify')->default(false);
            $table->boolean('rechargeability')->default(false);
            $table->boolean('is_active')->default(true);
            $table->tinyInteger('airalo_active')->default(1);
            $table->string('networkType')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('operators');
    }
};
