<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->smallInteger('number');
            $table->smallInteger('capacity');
            $table->text('description')->nullable();
            $table->timestamps();

            $table->foreignId('location_id')
                ->constrained('locations')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};
