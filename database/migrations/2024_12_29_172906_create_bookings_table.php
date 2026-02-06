<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('label');
            $table->dateTime('from_date');
            $table->dateTime('to_date');
            $table->boolean('glutenfree')->default(false);
            $table->boolean('vegetarian')->default(false);
            $table->boolean('lactose_free')->default(false);
            $table->boolean('single_room')->default(false);
            $table->boolean('baby_bed')->default(false);
            $table->timestamps();

            $table->foreignId('event_id')
                ->constrained('events');

            $table->foreignId('offering_id')
                ->constrained('offers');

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->foreignId('room_id')
                ->nullable()
                ->constrained('rooms');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
