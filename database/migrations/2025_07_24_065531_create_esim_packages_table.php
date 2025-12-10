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
        Schema::create('esim_packages', function (Blueprint $table) {
            $table->id();
            $table->json('country_ids');
            $table->string('region_id')->default(0);
            $table->string('package_id')->unique();
            $table->string('name')->nullable();
            $table->string('type')->nullable();
            $table->double('price')->default(0);
            $table->double('amount')->default(0);
            $table->bigInteger('day')->default(0);
            $table->boolean('is_unlimited')->nullable();
            $table->text('short_info')->nullable();
            $table->text('qr_installation')->nullable();
            $table->text('manual_installation')->nullable();
            $table->boolean('is_fair_usage_policy')->nullable();
            $table->text('fair_usage_policy')->nullable();
            $table->string('data', 50)->nullable();
            $table->decimal('net_price', 10, 2);
            $table->json('prices')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_popular')->default(false);
            $table->boolean('is_recommend')->default(false);
            $table->boolean('is_best_value')->default(false);
            $table->text('location')->nullable();
            $table->text('country')->nullable();
            $table->string('locationCode')->nullable();
            $table->string('speed')->nullable();
            $table->tinyInteger('airalo_active')->default(1);
            $table->string('esim_provider',30)->default('airalo');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('esim_packages');
    }
};
