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
        Schema::create('events', function (Blueprint $table) {
            $table->id()->primary();  // PK
            $table->string('name'); // event name / event title
            $table->text('description'); // description of the event
            $table->dateTime('start_date');
            $table->dateTime('end_date');
            $table->timestamps();

            // FKs
            $table->foreignId('location_id')->references('id')->on('locations')->onDelete('cascade'); // FK related location
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
