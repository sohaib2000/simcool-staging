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
        Schema::create('systemflags', function (Blueprint $table) {
            $table->id();
            $table->foreignId('flagGroupId')->constrained('flaggroups')->cascadeOnDelete();
            $table->bigInteger('parent_id')->default(0);
            $table->string('valueType')->nullable();
            $table->string('name')->nullable();
            $table->string('value')->nullable();
            $table->boolean('isActive')->default(1);
            $table->boolean('isDelete')->default(0);
            $table->string('displayName')->nullable();
            $table->longText('description')->nullable();
            $table->boolean('viewenable')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('systemflags');
    }
};
