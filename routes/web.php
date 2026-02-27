<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Host\EventController as EventController;
use App\Http\Controllers\Admin\HostLocationVisibilityController;
use App\Http\Controllers\Admin\AdminLocationController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\AdminOfferController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Public\VeranstaltungController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\Host\HostEventBookingController;


Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::prefix('veranstaltungen')
    ->name('public.veranstaltungen.')
    ->group(function () {
        Route::get('/', [VeranstaltungController::class, 'index'])->name('index');
        Route::get('/{event}', [VeranstaltungController::class, 'show'])->name('show'); // optional (für "Buchen"-Button)
    });

Route::get('/ui-test', function () {
    return Inertia::render('UiTest', [
        'message' => 'Inertia + React läuft ',
        'serverTime' => now()->toDateTimeString(),
    ]);
});

Route::get('/dashboard-ui', function () {
    return Inertia::render('Dashboard');
})->name('dashboard.ui');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// Profile (auth)
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// --- App routes (Gerüst) ---
// User (auth)
Route::middleware('auth')->group(function () {
    Route::get('/bookings', [BookingController::class, 'overview'])->name('bookings.overview');

    // New Booking: immer mit Event (aus Veranstaltungen kommt /bookings/new/{event})
    Route::get('/bookings/new/{event}', [BookingController::class, 'create'])->name('bookings.new');
    Route::post('/bookings/new/{event}', [BookingController::class, 'store'])->name('bookings.store');
    Route::delete('/events/{event}/bookings/{booking}', [BookingController::class, 'destroy'])->name('bookings.destroy');

    Route::get('/events/{event}/bookings/{booking}/edit', [BookingController::class, 'edit'])->name('bookings.edit');
    Route::put('/events/{event}/bookings/{booking}', [BookingController::class, 'update'])->name('bookings.update');

    Route::get('/anmeldungen/uebersicht', [BookingController::class, 'overview'])->name('bookings.overview');


    Route::get('/bookings/archive', fn() => Inertia::render('Bookings/Archive'))->name('bookings.archive');
});


// Host + Admin Events (shared controller + shared pages)
Route::middleware('auth')->group(function () {
    Route::prefix('host')->name('host.')->group(function () {
        Route::get('/events', [EventController::class, 'index'])->name('events.index');
        Route::get('/events/create', [EventController::class, 'create'])->name('events.create');
        Route::post('/events', [EventController::class, 'store'])->name('events.store');

        Route::get('/events/{event}/edit', [EventController::class, 'edit'])->name('events.edit');
        Route::put('/events/{event}', [EventController::class, 'update'])->name('events.update');

        Route::get('/events/{event}/bookings', [HostEventBookingController::class, 'index'])
            ->name('events.bookings');

        // Edit der Buchungen aus dem Overview
        Route::get('/events/{event}/bookings/{booking}/edit', [BookingController::class, 'edit'])->name('bookings.edit');
        Route::put('/events/{event}/bookings/{booking}', [BookingController::class, 'update'])->name('bookings.update');

        Route::delete('/events/{event}', [EventController::class, 'destroy'])->name('events.destroy');

        Route::get('/invoicing', fn() => Inertia::render('Host/Invoicing'));

        Route::get('/locations', fn() => Inertia::render('Host/Locations/Overview'));
        Route::get('/locations/request', fn() => Inertia::render('Host/Locations/Request'));
    });

    Route::prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', fn() => Inertia::render('Admin/Dashboard'))->name('dashboard');

        Route::get('/reporting', fn() => Inertia::render('Admin/Reporting'))->name('reporting');

        // Locations CRUD
        Route::get('/locations', [AdminLocationController::class, 'index'])->name('locations.index');
        Route::get('/locations/add', [AdminLocationController::class, 'create'])->name('locations.create');
        Route::post('/locations', [AdminLocationController::class, 'store'])->name('locations.store');
        Route::get('/locations/{location}/edit', [AdminLocationController::class, 'edit'])->name('locations.edit');
        Route::put('/locations/{location}', [AdminLocationController::class, 'update'])->name('locations.update');

        // Location-Zuweisung (Admin -> Host)
        Route::get('/locations/assign', [HostLocationVisibilityController::class, 'index'])->name('locations.assign');
        Route::post('/locations/assign', [HostLocationVisibilityController::class, 'update'])->name('locations.assign.update');

        // Offers CRUD
        Route::get('/offers', [AdminOfferController::class, 'index'])->name('offers.index');
        Route::get('/offers/create', [AdminOfferController::class, 'create'])->name('offers.create');
        Route::post('/offers', [AdminOfferController::class, 'store'])->name('offers.store');
        Route::get('/offers/{offer}/edit', [AdminOfferController::class, 'edit'])->name('offers.edit');
        Route::put('/offers/{offer}', [AdminOfferController::class, 'update'])->name('offers.update');
        Route::delete('/offers/{offer}', [AdminOfferController::class, 'destroy'])->name('offers.destroy');

        // Admin Events (shared controller + shared pages)
        Route::get('/events', [EventController::class, 'index'])->name('events.index');
        Route::get('/events/create', [EventController::class, 'create'])->name('events.create');
        Route::post('/events', [EventController::class, 'store'])->name('events.store');
        Route::get('/events/{event}/edit', [EventController::class, 'edit'])->name('events.edit');
        Route::put('/events/{event}', [EventController::class, 'update'])->name('events.update');
        Route::delete('/events/{event}', [EventController::class, 'destroy'])->name('events.destroy');

        Route::get('/users', [AdminUserController::class, 'index'])->name('users.index');
        Route::get('/users/{user}/edit', [AdminUserController::class, 'edit'])->name('users.edit');
        Route::put('/users/{user}', [AdminUserController::class, 'update'])->name('users.update');

        // Quick Actions
        Route::put('/users/{user}/confirm', [AdminUserController::class, 'confirm'])->name('users.confirm');
        Route::put('/users/{user}/block', [AdminUserController::class, 'block'])->name('users.block');

    });
});

Route::get('/faq', fn() => Inertia::render('Faq'));
Route::post('/logout', [\App\Http\Controllers\Auth\AuthenticatedSessionController::class, 'destroy'])->name('logout');

require __DIR__ . '/auth.php';