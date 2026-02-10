<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/ui-test', function () {
    return Inertia::render('UiTest', [
        'message' => 'Inertia + React läuft ',
        'serverTime' => now()->toDateTimeString(),
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// --- App routes (Gerüst) ---
// User (auth)
Route::middleware('auth')->group(function () {
    Route::get('/bookings', fn() => Inertia::render('Bookings/Overview'));
    Route::get('/bookings/new', fn() => Inertia::render('Bookings/New'));
    Route::get('/bookings/archive', fn() => Inertia::render('Bookings/Archive'));
});

// Host (auth) — später zusätzlich role-check
Route::middleware('auth')->prefix('host')->group(function () {
    Route::get('/events', fn() => Inertia::render('Host/Events/Overview'));
    Route::get('/events/create', fn() => Inertia::render('Host/Events/Create'));
    Route::get('/events/manage', fn() => Inertia::render('Host/Events/Manage'));
    Route::get('/invoicing', fn() => Inertia::render('Host/Invoicing'));

    Route::get('/locations', fn() => Inertia::render('Host/Locations/Overview'));
    Route::get('/locations/request', fn() => Inertia::render('Host/Locations/Request'));
});

// Admin (auth) — später zusätzlich role-check
Route::middleware('auth')->prefix('admin')->group(function () {
    Route::get('/locations/add', fn() => Inertia::render('Admin/Locations/Add'));
    Route::get('/locations/assign', fn() => Inertia::render('Admin/Locations/Assign'));
    Route::get('/reporting', fn() => Inertia::render('Admin/Reporting'));
});

Route::get('/faq', fn() => Inertia::render('Faq'));

require __DIR__ . '/auth.php';
