<?php

namespace App\Traits;

use App\Models\Media\{PropertyVirtualMedia,PropertyMedia};
use Illuminate\Http\Request;
use App\Models\Sales\{PropertyPayment,Property};


trait TraitsPropertyMedia
{

    public function uploadPaymentMedia(Request $request,PropertyPayment $payment)
    {
        $request->validate([
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png,gif,svg,doc,docx,xls,xlsx,ppt,pptx',
        ]);

       $files = $request->file('file');
    //    foreach ($files as $file) {
           $payment->addMedia($files)
                   ->toMediaCollection('payment_media');
    //    }
    }

    public function uploadPropertyMedia(Request $request,PropertyMedia $property)
    {
        $request->validate([
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png,gif,svg,doc,docx,xls,xlsx,ppt,pptx',
        ]);

        $property->addMedia($request->file('file'))
        ->toMediaCollection('property_media');
    }

    public function uploadVirtualTourMedia(Request $request,PropertyVirtualMedia $virtualTour)
    {
        $request->validate([
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png,gif,svg,doc,docx,xls,xlsx,ppt,pptx',
        ]);

        $virtualTour->addMedia($request->file('file'))
        ->toMediaCollection('virtual_tour_media');
    }
}
