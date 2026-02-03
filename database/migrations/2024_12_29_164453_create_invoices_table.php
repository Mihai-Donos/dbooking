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
        Schema::create('invoices', function (Blueprint $table) {
            $table->id()->primary();  // PK
            //$table->unsignedBigInteger('user_id');
            $table->integer('number')->from(10000); // invoice number
            $table->string('status'); // temporary, billed, open, paid, void
            $table->decimal('amount_charged', 10, 2);  // total billed on the invoice  
            $table->decimal('amount_payed', 10, 2);  // total billed on the invoice 
            $table->timestamps();

            // FKs
            $table->foreignId('user_id')->references('id')->on('users')->onDelete('cascade'); // FK owner of the invoice

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
