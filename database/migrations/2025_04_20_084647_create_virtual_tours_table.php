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
        Schema::create('virtual_tours', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->nullableMorphs('tourable');
            $table->timestamps();
        });

        Schema::create('tour_nodes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('virtual_tour_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('caption')->nullable();
            $table->string('panorama_path');
            $table->string('thumbnail_path')->nullable();
            $table->json('gps')->nullable();
            $table->json('sphere_correction')->nullable();
            $table->boolean('start_node')->default(false);
            $table->timestamps();
        });

        Schema::create('tour_links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('from_node_id')->constrained('tour_nodes')->cascadeOnDelete();
            $table->foreignId('to_node_id')->constrained('tour_nodes')->cascadeOnDelete();
            $table->timestamps();
        });

        // Schema::create('tour_markers', function (Blueprint $table) {
        //     $table->id();
        //     $table->foreignId('node_id')->constrained('tour_nodes')->cascadeOnDelete();
        //     $table->string('tooltip')->nullable();
        //     $table->string('image_path')->nullable();
        //     $table->json('gps')->nullable();
        //     $table->json('size')->nullable();
        //     $table->string('anchor')->nullable();
        //     $table->timestamps();
        // });

        Schema::create('tour_node_markers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tour_node_id')->constrained()->cascadeOnDelete();
            $table->string('type')->default('link'); // e.g., link/info/etc
            $table->string('label')->nullable();
            $table->json('position'); // longitude/latitude or x/y
            $table->foreignId('target_node_id')->nullable()->constrained('tour_nodes')->nullOnDelete(); // ← important
            $table->timestamps();
        });


    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('virtual_tours');
        Schema::dropIfExists('tour_nodes');
        Schema::dropIfExists('tour_links');
        Schema::dropIfExists('tour_markers');
    }
};
