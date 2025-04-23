<?php

namespace App\Http\Controllers;

use App\Models\Tour\VirtualTour;
use App\Models\Tour\TourNode;
use App\Models\Tour\TourLink;
use App\Models\Tour\TourMarker;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Services\VirtualTour\CreateTourService;

class VirtualTourController extends Controller
{

    /**
     * @var CreateTourService
     */
    private $createTourService;

    public function __construct(CreateTourService $createTourService)
    {
        $this->createTourService = $createTourService;
    }

    public function virtualTourCreateView()
    {
        // return view('virtual_tour.new');
        return view('virtual_tour.new_draw');
    }

    // Save a new virtual tour
    public function save(Request $request)
    {
        return $this->createTourService->createTour($request);
        // return response()->json($tour);

    }

    // Load a virtual tour
    public function load($id)
    {
        $tour = VirtualTour::with(['nodes.media', 'nodes.links', 'nodes.markers'])->findOrFail($id);

        return response()->json($tour);
    }

    public function index()
    {
        $tours = VirtualTour::all();
        return view('virtual_tour.index', compact('tours'));
    }

    public function view($id)
    {
        // $tour = VirtualTour::with(['nodes.links', 'nodes.markers'])->findOrFail($id);
        $tour = VirtualTour::with(['nodes.media', 'nodes.links', 'nodes.markers'])->findOrFail($id);
        return view('virtual_tour.view', ['tourId' => $id]);
        return $tour;
    }





    // public function createThumbnails($tour)
    // {
    //     $nodes = $tour->nodes;
    //     foreach ($nodes as $node) {
    //         $node->createThumbnail();
    //     }
    // }
}
