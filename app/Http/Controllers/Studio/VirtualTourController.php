<?php

namespace App\Http\Controllers\Studio;

use App\Http\Controllers\Controller;
use App\Models\Tour\VirtualTour;
use App\Services\VirtualTour\TourStudioService;

class VirtualTourController extends Controller
{

    private $tourStudioService;

    public function __construct(TourStudioService $tourStudioService)
    {
        $this->tourStudioService = $tourStudioService;
    }
    // this is a list of tours
    public function index()
    {
        $tours = $this->tourStudioService->getAllTours();
        return view('studio.index', compact('tours'));
    }

    public function show($id)
    {
        $tour = $this->tourStudioService->getTour($id);
        // return $tour;
        return view('studio.show', compact('tour'));
    }

    // this is a view for creating a tour
    public function create()
    {
        return view('studio.create_tour');
    }

    // this is a view for drawing a tour
    public function draw($id)
    {
        return view('studio.draw_tour', compact('id'));
    }

    // this is a view for editing a tour
    public function edit(VirtualTour $tour)
    {
        // load tour nodes and markers
        // return view('virtual_tour.edit', ['tour' => $tour]);
    }

    public function destroy($id)
    {
        $this->tourStudioService->deleteTour($id);
        return redirect()->route('studio.index')->with('success', 'Tour deleted successfully');
    }



}
