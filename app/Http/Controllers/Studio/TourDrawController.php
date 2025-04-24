<?php

namespace App\Http\Controllers\Studio;

use App\Http\Controllers\Controller;
use App\Models\Tour\VirtualTour;
use App\Models\Tour\TourNode;
use App\Services\VirtualTour\TourDrawService;
use Illuminate\Http\Request;

class TourDrawController extends Controller
{
    private $tourDrawService;

    public function __construct(TourDrawService $tourDrawService)
    {
        $this->tourDrawService = $tourDrawService;
    }

    /**
     * Display the tour drawing interface.
     *
     * @param int $id
     * @return \Illuminate\Contracts\View\View
     */
    public function show($id)
    {
        $tour = $this->tourDrawService->getTour($id);
        return view('studio.draw_tour', compact('tour'));
    }

    /**
     * Get drawings for a specific node in a tour.
     *
     * @param int $tourId
     * @param int $nodeId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getNodeDrawings($tourId, $nodeId)
    {
        $drawings = $this->tourDrawService->getNodeDrawings($tourId, $nodeId);
        return response()->json([
            'success' => true,
            'drawings' => $drawings
        ]);
    }

    /**
     * Save drawings for a specific node in a tour.
     *
     * @param Request $request
     * @param int $tourId
     * @param int $nodeId
     * @return \Illuminate\Http\JsonResponse
     */
    public function saveNodeDrawings(Request $request, $tourId, $nodeId)
    {
        $result = $this->tourDrawService->saveNodeDrawings(
            $tourId,
            $nodeId,
            $request->input('polygons', []),
            $request->input('texts', [])
        );

        return response()->json([
            'success' => $result,
            'message' => $result ? 'Drawings saved successfully' : 'Failed to save drawings'
        ]);
    }

    // drawer view
    function drawer($id)
    {
        $tour = $this->tourDrawService->getTour($id);
        return view('studio.draw_tour', compact('tour'));
    }


    // edit polygon
    function editPolygonView()
    {
        return view('virtual_tour.edit_polygon');
    }

    // edit polygon
    function editPolygon(Request $request)
    {
        return $request->all();
    }
}
