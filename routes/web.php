<?php

use App\Http\Controllers\ImageDrawerController;
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




// Route::prefix('/360')->group(function () {
//     // Route::get('/create', [VirtualTourController::class, 'virtualTourCreateView'])->name('virtual-tour');
//     Route::get('/', function () {
//         return view('virtual_tour.view');
//     })->name('virtual-tour');
//     Route::get('/new', function () {
//         return view('virtual_tour.new');
//     })->name('virtual-tour-new');
// });


// studio , 360 and image drawer
// 360 virtual tour
Route::prefix('/virtual-tours')->group(function () {
    Route::get('/create', [VirtualTourController::class, 'virtualTourCreateView']);
    Route::post('/save', [VirtualTourController::class, 'save']);
    Route::get('/{id}', [VirtualTourController::class, 'load']);
    Route::get('/', [VirtualTourController::class, 'index']);
    Route::get('/view/{id}', [VirtualTourController::class, 'view'])->name('virtual_tour_view');
});
// image drawer
Route::prefix('/image-drawer')->group(function () {
    Route::get('/create', [ImageDrawerController::class, 'imageDrawerCreateView']);
    Route::post('/save', [ImageDrawerController::class, 'save']);
    Route::get('/{id}', [ImageDrawerController::class, 'load']);
    Route::get('/', [ImageDrawerController::class, 'index']);
});

