<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('invoice_positions', function (Blueprint $table) {
            $table->id();
            $table->string('type');
            $table->string('label');
            $table->decimal('value', 10, 2);
            $table->timestamps();

            $table->foreignId('invoice_id')
                ->constrained('invoices')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoice_positions');
    }
};
