<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('blocks', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description');
            $table->foreignId('project_id')->constrained()->onDelete('cascade');

            $table->enum('status', ['available', 'n-a', 'sold', 'booked'])->default('available');

            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('blocks');
    }
};
