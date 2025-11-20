<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateEsimOrdersTable extends Migration
{
    public function up()
    {
        Schema::create('esim_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('esim_package_id')->constrained('esim_packages');
            $table->foreignId('currency_id')->constrained('currencies');
            $table->string('order_ref')->unique();
            $table->double('gst')->default('00.00');
            $table->double('provider_price');
            $table->double('total_amount');
            $table->enum('status', ['pending', 'processing', 'active', 'failed', 'cancelled','completed','paid'])->default('pending');
            $table->json('activation_details')->nullable(); // Airalo response, QR, etc
            $table->string('webhook_request_id',100)->nullable();
            $table->text('user_note')->nullable();
            $table->text('admin_note')->nullable();
            $table->timestamps();
        });
    }
    public function down() { Schema::dropIfExists('esim_orders'); }
}
