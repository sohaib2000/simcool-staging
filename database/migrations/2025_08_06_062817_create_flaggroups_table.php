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
        Schema::create('flaggroups', function (Blueprint $table) {
            $table->id();
            $table->string('flagGroupName');
            $table->string('parentFlagGroupId',100)->nullable();
            $table->string('displayOrder',100)->nullable();
            $table->boolean('isActive')->default(1);
            $table->boolean('isDelete')->default(0);
            $table->text('description')->nullable();
            $table->boolean('viewenable')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('flaggroups');
    }
};
