<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateKycsTable extends Migration
{
    public function up()
    {
        Schema::create('kycs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('full_name');
            $table->date('dob')->nullable();
            $table->text('address')->nullable();
            $table->string('identity_card_no')->nullable();
            $table->string('identity_card')->nullable();
            $table->string('pancard')->nullable();
            $table->string('photo')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('admin_note')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('kycs');
    }
}
