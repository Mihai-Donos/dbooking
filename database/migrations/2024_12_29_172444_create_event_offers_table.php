<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('event_offers', function (Blueprint $table) {
            $table->id();
            $table->decimal('price', 10, 2);  // price
            $table->boolean('visible')->default(1); // by default every entry is visible to be booked
            $table->timestamps();

            // FKs
            $table->foreignId('event_id')->references('id')->on('events')->onDelete('cascade'); // FK related event   
            $table->foreignId('offering_id')->references('id')->on('offers')->onDelete('cascade'); // FK related offering
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_offers');
    }
};
