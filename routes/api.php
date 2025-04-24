<?php

use App\Http\Controllers\AppVirtualTourController;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\PropertyMediaController;
use App\Http\Controllers\Studio\ApiTourController;
use App\Http\Controllers\VirtualTourController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::prefix('properties')->group(function () {
    Route::get('/', [PropertyController::class, 'getAllProperties']);
    Route::get('/{property}/details', [PropertyController::class, 'getPropertyDetails']);
    Route::get('/{property}/payments', [PropertyController::class, 'getPropertyPayments']);
    Route::get('/{property}/media', [PropertyController::class, 'getPropertyMedia']);
    Route::get('/{property}/virtual-tours', [PropertyController::class, 'getPropertyVirtualTours']);

    /// addming media
    Route::prefix('/{property}/add-media')->group(function () {
        Route::post('/payment', [PropertyMediaController::class, 'addPaymentMedia']);
        Route::post('/media', [PropertyMediaController::class, 'addPropertyMedia']);
        Route::post('/virtual-tour', [PropertyMediaController::class, 'addVirtualTourMedia']);

    });
});

Route::prefix('/virtual-tours')->group(function () {
    // Route::get('/', [VirtualTourController::class, 'index']);
    Route::post('/', [AppVirtualTourController::class, 'save']);
    Route::get('/{id}', [AppVirtualTourController::class, 'load']);

});

// Route::post('/virtual-tours/save-polygon', function (Request $request) {
//     logger($request->all());
//     return $request->all();
// });

// Studio API routes
Route::prefix('studio')->group(function () {
    Route::post('/tours', [App\Http\Controllers\TourStudioController::class, 'store']);
    Route::get('/tours/{id}/data', [ApiTourController::class, 'getTourData']);
    Route::put('/tours/{id}', [App\Http\Controllers\TourStudioController::class, 'update']);
    Route::post('/tours/{id}/polygons', [App\Http\Controllers\TourStudioController::class, 'savePolygons']);
    Route::delete('/tours/{id}', [App\Http\Controllers\TourStudioController::class, 'destroy']);

    // Drawing API routes
    Route::get('/tours/{tourId}/nodes/{nodeId}/drawings', [App\Http\Controllers\Studio\TourDrawController::class, 'getNodeDrawings']);
    Route::post('/tours/{tourId}/nodes/{nodeId}/drawings', [App\Http\Controllers\Studio\TourDrawController::class, 'saveNodeDrawings']);
});
