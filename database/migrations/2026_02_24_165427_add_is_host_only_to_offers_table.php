<?php

// database/migrations/2026_02_24_XXXXXX_add_is_host_only_to_offers_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('offers', function (Blueprint $table) {
            $table->boolean('is_host_only')
                ->default(false)
                ->after('charge_type'); // oder an passende Stelle
        });
    }

    public function down(): void
    {
        Schema::table('offers', function (Blueprint $table) {
            $table->dropColumn('is_host_only');
        });
    }
};
