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
        Schema::create('invoice_positions', function (Blueprint $table) {
            $table->id()->primary();  // PK
            //$table->unsignedBigInteger('invoice_id');
            $table->string('type'); // per day, once 
            $table->string('label'); // description of the billed postion
            $table->decimal('value', 10, 2);  // total billed on the invoice  
            $table->timestamps();

            //FKs
            $table->foreignId('invoice_id')->references('id')->on('invoices')->onDelete('cascade'); // FK owner of the invoice
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoice_positions');
    }
};
