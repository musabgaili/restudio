<?php

namespace App\Http\Controllers\Studio;

use App\Http\Controllers\Controller;
use App\Services\VirtualTour\TourStudioService;

class ApiTourController extends Controller
{

    private $tourStudioService;
    public function __construct(TourStudioService $tourStudioService)
    {
        $this->tourStudioService = $tourStudioService;
    }

    public function getTourData($id)
    {
        logger($id);
        return $this->tourStudioService->getTour($id);
    }
}
