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
        Schema::create('user_esims', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('order_id')->constrained('esim_orders');
            $table->foreignId('package_id')->constrained('esim_packages');
            $table->string('iccid');
            $table->string('imsis')->nullable();
            $table->string('msisdn')->nullable();
            $table->string('matching_id')->nullable();
            $table->string('qrcode');
            $table->string('qrcode_url');
            $table->string('airalo_code')->nullable();
            $table->string('apn_type')->nullable();
            $table->string('apn_value')->nullable();
            $table->boolean('is_roaming')->default(0);
            $table->string('confirmation_code')->nullable();
            $table->json('apn')->nullable();
            $table->string('direct_apple_installation_url')->nullable();
            $table->string('status')->default('NOT_ACTIVE');
            $table->string('remaining')->nullable();
            $table->string('activated_at')->nullable();
            $table->string('expired_at')->nullable();
            $table->string('finished_at')->nullable();
            $table->boolean('activation_notified')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_esims');
    }
};
