<?php

// use App\Http\Controllers\ImageDrawerController;

use App\Http\Controllers\AppVirtualTourController;
use App\Http\Controllers\Studio\{VirtualTourController, TourDrawController};
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

// Route::get('/', function () {
//     return view('sales.properties');
// });
//
Auth::routes();

Route::get('/home', [App\Http\Controllers\HomeController::class, 'index'])->name('home');
// Route::get('/', [App\Http\Controllers\HomeController::class, 'properties'])->name('properties');





Route::prefix('studio')->name('studio.')->group(function () {
    // Main tour routes
    Route::get('/', [VirtualTourController::class, 'index'])->name('index');
    Route::get('/tours/create', [VirtualTourController::class, 'create'])->name('create');
    Route::get('/tours/{id}', [VirtualTourController::class, 'show'])->name('show');
    Route::get('/tours/{id}/edit', [VirtualTourController::class, 'edit'])->name('edit');
    Route::delete('/tours/{id}', [VirtualTourController::class, 'destroy'])->name('destroy');

    // Tour Drawing routes
    // Route::get('/tours/{id}/draw', [TourDrawController::class, 'show'])->name('tours.draw');

    // Legacy routes that may be removed later
    Route::get('/draw/{id}', [TourDrawController::class, 'drawer'])->name('draw');
    Route::get('/draw/editPolygon/{id}', [TourDrawController::class, 'editPolygonView'])->name('editPolygonView');
    Route::post('/draw/editPolygon', [TourDrawController::class, 'editPolygon'])->name('editPolygon');
});






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
    Route::get('/create', [AppVirtualTourController::class, 'virtualTourCreateView']);
    Route::post('/save', [AppVirtualTourController::class, 'save']);
    Route::get('/{id}', [AppVirtualTourController::class, 'load']);
    Route::get('/', [AppVirtualTourController::class, 'index']);
    Route::get('/view/{id}', [AppVirtualTourController::class, 'view'])->name('virtual_tour_view');
});
// image drawer
// Route::prefix('/image-drawer')->group(function () {
//     Route::get('/create', [ImageDrawerController::class, 'imageDrawerCreateView']);
//     Route::post('/save', [ImageDrawerController::class, 'save']);
//     Route::get('/{id}', [ImageDrawerController::class, 'load']);
//     Route::get('/', [ImageDrawerController::class, 'index']);
// });

// Studio routes for virtual tours
Route::prefix('old-studio')->name('old-studio.')->group(function () {
    Route::get('/', [App\Http\Controllers\TourStudioController::class, 'index'])->name('index');
    Route::get('/create', [App\Http\Controllers\TourStudioController::class, 'create'])->name('create');
    Route::post('/store', [App\Http\Controllers\TourStudioController::class, 'store'])->name('store');
    Route::get('/{id}', [App\Http\Controllers\TourStudioController::class, 'show'])->name('show');
    Route::put('/{id}', [App\Http\Controllers\TourStudioController::class, 'update'])->name('update');
    Route::delete('/{id}', [App\Http\Controllers\TourStudioController::class, 'destroy'])->name('destroy');
});


