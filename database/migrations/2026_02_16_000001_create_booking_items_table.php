<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('booking_items', function (Blueprint $table) {
            $table->id();

            $table->foreignId('booking_id')
                ->constrained('bookings')
                ->cascadeOnDelete();

            $table->foreignId('offer_id')
                ->constrained('offers');

            // Snapshot-Daten (damit spätere Offer-Änderungen alte Buchungen nicht verfälschen)
            $table->string('name'); // Offering Name zum Zeitpunkt der Buchung

            // 1 = PER_BOOKING, 2 = PER_DAY (entspricht OfferChargeType)
            $table->unsignedTinyInteger('charge_type');

            // Snapshot-Preise
            $table->decimal('unit_price', 10, 2);
            $table->unsignedInteger('quantity'); // nights oder 1
            $table->decimal('line_total', 10, 2);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_items');
    }
};