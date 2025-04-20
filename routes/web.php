<?php

use App\Http\Controllers\VirtualTourController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

// Route::get('/', function () {
//     return view('sales.properties');
// });
//
Auth::routes();

Route::get('/home', [App\Http\Controllers\HomeController::class, 'index'])->name('home');
// Route::get('/', [App\Http\Controllers\HomeController::class, 'properties'])->name('properties');




Route::prefix('/360')->group(function () {
    // Route::get('/create', [VirtualTourController::class, 'virtualTourCreateView'])->name('virtual-tour');
    Route::get('/', function () {
        return view('virtual_tour.view');
    })->name('virtual-tour');
    Route::get('/new', function () {
        return view('virtual_tour.new');
    })->name('virtual-tour-new');
});

