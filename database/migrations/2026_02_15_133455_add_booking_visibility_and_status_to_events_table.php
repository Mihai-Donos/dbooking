<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            // 0 Vorbereitung, 1 Anmeldung möglich, 2 Anmeldung beendet, 3 Im Gange, 4 Beendet, 5 Abgesagt
            $table->unsignedTinyInteger('status')->default(0)->after('end_date');

            // Zeitraum, in dem Gäste (user) buchen dürfen
            $table->dateTime('booking_visible_from')->nullable()->after('status');
            $table->dateTime('booking_visible_to')->nullable()->after('booking_visible_from');

            $table->index(['status']);
            $table->index(['booking_visible_from', 'booking_visible_to']);
        });
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['booking_visible_from', 'booking_visible_to']);

            $table->dropColumn(['status', 'booking_visible_from', 'booking_visible_to']);
        });
    }
};