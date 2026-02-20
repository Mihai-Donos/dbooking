<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->unsignedTinyInteger('status')->default(0)->after('total_amount');
            $table->foreignId('room_id')->nullable()->constrained('rooms')->nullOnDelete()->after('user_id');

            $table->index(['user_id', 'event_id']);
            $table->index('status');
            $table->index('room_id');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropIndex(['bookings_user_id_event_id_index']);
            $table->dropIndex(['bookings_status_index']);
            $table->dropIndex(['bookings_room_id_index']);

            $table->dropConstrainedForeignId('room_id');
            $table->dropColumn('status');
        });
    }
};