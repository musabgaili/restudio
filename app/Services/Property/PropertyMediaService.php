<?php

namespace App\Services\Property;

use App\Models\Media\PropertyMedia;
use App\Models\Media\PropertyVirtualMedia;
use App\Models\Sales\PropertyPayment;
use App\Models\Sales\Property;
use Illuminate\Http\Request;
use App\Traits\TraitsPropertyMedia;
use Illuminate\Support\Facades\Log;

class PropertyMediaService
{

    use TraitsPropertyMedia;
    public function createPayment(Request $request, Property $property)
    {
        logger('Hit on Service->createPayment()');
        logger($request->all());

        // Note: The PropertyPaymentForm.vue only sends a single file, not an array
        // The form sends: property_id, payment_type, deposit_date, deposit_type, amount, file
        try {
            $request->validate([
                'file' => 'nullable|file|mimes:pdf,jpg,jpeg,png',
                'payment_type' => 'required|string',
                'deposit_date' => 'required|date',
                'deposit_type' => 'required|string',
                'amount' => 'required|numeric',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation failed: ' . json_encode($e->errors()));
        }

        Log::debug('Payment data is here ::', $request->all());

        // Create a new payment record
        $payment = new PropertyPayment();
        $payment->property_id = $property->id;
        $payment->text_property_id = $property->name;
        $payment->payment_type = $request->payment_type;
        $payment->deposit_date = $request->deposit_date;
        $payment->deposit_type = $request->deposit_type;
        $payment->amount = $request->amount;
        $payment->save();

        // Upload the file if provided
        if ($request->hasFile('file')) {
            Log::debug('File name: ' . $request->file('file')->getClientOriginalName());
            // $payment->uploadMedia($request->file('file'), 'payment_media');
            $payment->addMedia($request->file('file'))
                ->toMediaCollection('payment_media');
        }

        return $property->payments()->get();
    }

    public function createPropertyMedia(Request $request, Property $property)
    {
        logger('Hit on Service->createPropertyMedia()');
        logger($request->all());
        // Validate the request - files are coming as an array from PropertyMediaUploadForm.vue
        try {
            $request->validate([
                'file' => 'required|array',
                'file.*' => 'required|file|mimes:pdf,jpg,jpeg,png,PNG,JPEG,JPG,PDF',
                'media_type' => 'nullable|string',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation failed: ' . json_encode($e->errors()));
        }


        Log::debug('Property Media are here ::', $request->all());
        // Loop through each file in the array
        foreach ($request->file('file') as $file) {
            Log::debug('File name: ' . $file->getClientOriginalName());

            // Create a new PropertyMedia record
            $propertyMedia = new PropertyMedia();
            $propertyMedia->property_id = $property->id;
            $propertyMedia->media_type = $request->media_type;
            $propertyMedia->title = $request->title ?? uniqid();
            // ?? $file->getClientOriginalName();
            $propertyMedia->save();

            // Upload the media file
            $propertyMedia->addMedia($file)
                ->toMediaCollection('property_media');
        }

        return $property->propertyMedia()->get();
    }

    public function createVirtualTourMedia(Request $request, Property $property)
    {
        logger('Hit on Service->createVirtualTourMedia()');
        logger($request->all());
        // Validate the request - files are coming as an array from PropertyVirtualTourForm.vue
        try {
            $request->validate([
                'file' => 'required|array',
                'file.*' => 'required|file|mimes:mp4,webm,mov',
                // 'title' => 'required|string',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation failed: ' . json_encode($e->errors()));
        }

        Log::debug('Virtual Tour Media are here ::', $request->all());
        // Loop through each file in the array
        foreach ($request->file('file') as $file) {
            Log::debug('File name: ' . $file->getClientOriginalName());

            // Create a new virtual tour record
            $virtualTour = new PropertyVirtualMedia();
            $virtualTour->property_id = $property->id;
            $virtualTour->title = $file->getClientOriginalName();
            $virtualTour->save();

            // Upload the media file
            $virtualTour->addMedia($file)
                ->toMediaCollection('property_virtual_media');
        }

        return $property->virtualTours()->get();
    }




    // // handle payment media
    // public function uploadPaymentMedia(Request $request,PropertyPayment $payment)
    // {
    //     $request->validate([
    //         'payment_media' => 'required|file|mimes:pdf,jpg,jpeg,png',
    //     ]);

    //    $payment  ->addMedia($request->file('payment_media'))
    //    ->toMediaCollection('payment_media');
    // }
}
