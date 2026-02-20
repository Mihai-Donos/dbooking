<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            // offering_id entfernen (war vorher 1 Booking = 1 Offering)
            if (Schema::hasColumn('bookings', 'offering_id')) {
                $table->dropConstrainedForeignId('offering_id');
            }

            // room_id erstmal raus (kann später separat wieder sauber angebunden werden)
            if (Schema::hasColumn('bookings', 'room_id')) {
                $table->dropConstrainedForeignId('room_id');
            }

            // label optional: wenn du es nicht mehr brauchst, entferne es.
            // (Wenn du es behalten willst, kommentiere diese 3 Zeilen aus)
            if (Schema::hasColumn('bookings', 'label')) {
                $table->dropColumn('label');
            }

            // Nächte + Gesamtpreis
            $table->unsignedInteger('nights')->default(1)->after('to_date');
            $table->decimal('total_amount', 10, 2)->default(0)->after('nights');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            // rollback: label wieder herstellen (optional)
            if (!Schema::hasColumn('bookings', 'label')) {
                $table->string('label')->nullable();
            }

            // rollback: offering_id wieder herstellen (als constrained)
            if (!Schema::hasColumn('bookings', 'offering_id')) {
                $table->foreignId('offering_id')->constrained('offers');
            }

            // rollback: room_id wieder herstellen
            if (!Schema::hasColumn('bookings', 'room_id')) {
                $table->foreignId('room_id')->nullable()->constrained('rooms');
            }

            if (Schema::hasColumn('bookings', 'nights')) {
                $table->dropColumn('nights');
            }
            if (Schema::hasColumn('bookings', 'total_amount')) {
                $table->dropColumn('total_amount');
            }
        });
    }
};