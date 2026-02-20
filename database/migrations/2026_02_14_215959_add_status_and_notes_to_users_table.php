<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // 0 = New, 1 = Confirmed, 2 = Blocked
            $table->unsignedTinyInteger('status')
                ->default(0)
                ->after('role')
                ->index();

            // Allgemeine Infos (User-Eingabe bei Registrierung)
            $table->text('notes')
                ->nullable()
                ->after('password');
        });

        // Bestehende Dummy-User NICHT aussperren:
        DB::table('users')->update(['status' => 1]);
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropColumn('status');
            $table->dropColumn('notes');
        });
    }
};