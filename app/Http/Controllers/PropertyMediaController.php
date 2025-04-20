<?php

namespace App\Http\Controllers;
use App\Models\Sales\Property;
use App\Services\Property\PropertyMediaService;
use Illuminate\Http\Request;

class PropertyMediaController extends Controller
{

    protected $propertyMediaService;
    public function __construct(PropertyMediaService $propertyMediaService)
    {
        $this->propertyMediaService = $propertyMediaService;
    }

    public function addPaymentMedia(Request $request,Property $property)
    {
        return $this->propertyMediaService->createPayment($request,$property);
    }


    public function addPropertyMedia(Request $request,Property $property)
    {
        logger('Hit on addPropertyMedia()');
        return $this->propertyMediaService->createPropertyMedia($request,$property);
    }

    public function addVirtualTourMedia(Request $request,Property $property)
    {
        return $this->propertyMediaService->createVirtualTourMedia($request,$property);
    }
}
