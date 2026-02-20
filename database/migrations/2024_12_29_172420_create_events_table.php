<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();

            $table->string('name');
            $table->text('description');

            $table->dateTime('start_date');
            $table->dateTime('end_date');

            $table->timestamps();

            $table->foreignId('location_id')
                ->constrained('locations')
                ->cascadeOnDelete();

            // entspricht deiner DB-Struktur (nullable + FK users + cascade)
            $table->foreignId('host_id')
                ->nullable()
                ->constrained('users')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};