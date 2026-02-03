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
        Schema::create('rooms', function (Blueprint $table) {
            $table->id()->primary();  // PK
            //$table->unsignedBigInteger('location_id');
            $table->smallInteger('number'); // room number
            $table->smallInteger('capacity'); // max capacity
            $table->text('description')->nullable();  // room description
            $table->timestamps();

            // FKs
            $table->foreignId('location_id')->references('id')->on('locations')->onDelete('cascade'); // FK owner of the invoice
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};
