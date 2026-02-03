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
        Schema::create('offers', function (Blueprint $table) {
            $table->id()->primary();  // PK
            $table->string('name'); // name / label of the offering
            $table->text('description')->nullable(); // addintional explenation of the offering
            $table->smallInteger('type')->nullable(); // not sure yet
            $table->smallInteger('charge_type'); // to be charged once, or per day
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('offers');
    }
};
