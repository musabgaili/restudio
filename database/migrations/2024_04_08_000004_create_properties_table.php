<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            // $table->string('name');
            // $table->decimal('price', 10, 2);
            // $table->decimal('area', 10, 2);
            // $table->string('type');
            // $table->integer('bedrooms');
            // $table->string('virtual_tour_link')->nullable();
            // $table->foreignId('block_id')->constrained()->onDelete('cascade');
            // $table->enum('status', ['available', 'n-a', 'sold', 'booked'])->default('available');
            // $table->enum('type', ['land', 'apartment'])->default('land');

            $table->string('name');
            $table->decimal('price', 12, 2); // total price
            $table->decimal('area', 10, 2);
            $table->decimal('price_per_meter', 10, 2)->nullable();
            $table->decimal('remaining_amount', 12, 2)->nullable();
            $table->enum('type', ['apartment' ,'land'])->default('land'); // basic type
            $table->string('property_type_detail')->nullable(); // more specific type like "سكني فلل"
            $table->integer('bedrooms')->nullable(); // nullable since not all properties have this
            $table->string('virtual_tour_link')->nullable();
            $table->foreignId('block_id')->constrained()->onDelete('cascade');
            $table->integer('block_number')->nullable();
            $table->string('zone')->nullable();
            $table->enum('status', [ 'na', 'available', 'sold', 'booked'])->default('na');
            $table->string('street_width')->nullable();
            $table->string('orientation')->nullable(); // الواجهة
            $table->decimal('front_width', 10, 2)->nullable(); // عرض الواجهة
            $table->decimal('depth', 10, 2)->nullable(); // عمق
            $table->text('notes')->nullable(); // ملاحظات
            $table->geometry('shape', 'polygon')->nullable(); // for map visualization
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('properties');
    }
};
