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
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('label'); // first name and family name provided by the user, separated by a semicolon ;
            $table->dateTime('from_date'); // booked from date
            $table->dateTime('to_date'); // booken to date
            $table->boolean('glutenfree')->default(0);   // informational purpose for meals
            $table->boolean('vegetarian')->default(0);   // informational purpose for meals
            $table->boolean('lactose_free')->default(0); // informational purpose for meals
            $table->boolean('single_room')->default(0);  // informational purpose for room assignments
            $table->boolean('baby_bed')->default(0);     // informational purpose for room assignments           
            $table->timestamps();

            //FKs
            $table->foreignId('event_id')->references('id')->on('events'); // FK related event   
            $table->foreignId('offering_id')->references('id')->on('offers'); // FK related offering
            $table->foreignId('user_id')->references('id')->on('users')->onDelete('cascade'); // FK related user   
            $table->foreignId('room_id')->default(0)->references('id')->on('rooms'); // FK to assigned room
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
