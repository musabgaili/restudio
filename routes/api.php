<?php

use App\Http\Controllers\PropertyController;
use App\Http\Controllers\PropertyMediaController;
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

Route::post('/virtual-tours', [VirtualTourController::class, 'save']);
Route::get('/virtual-tours/{id}', [VirtualTourController::class, 'load']);
Route::post('/virtual-tours/save-polygon', function (Request $request) {
    return $request->all();
});