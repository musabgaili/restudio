<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\TourStudio\TourStudioService;

class TourStudioController extends Controller
{
    /**
     * @var TourStudioService
     */
    private $tourStudioService;

    public function __construct(TourStudioService $tourStudioService)
    {
        $this->tourStudioService = $tourStudioService;
    }

    /**
     * Display the tour creation interface.
     *
     * @return \Illuminate\Contracts\View\View
     */
    public function create()
    {
        return view('studio.new');
    }

    /**
     * Store a new tour with all related data.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        return $this->tourStudioService->createTour($request);
    }

    /**
     * Display the list of all tours.
     *
     * @return \Illuminate\Contracts\View\View
     */
    public function index()
    {
        $tours = $this->tourStudioService->getAllTours();
        return view('studio.index', compact('tours'));
    }

    /**
     * Display a specific tour.
     *
     * @param int $id
     * @return \Illuminate\Contracts\View\View
     */
    public function show($id)
    {
        $tour = $this->tourStudioService->getTour($id);
        return view('studio.show', compact('tour'));
    }

    /**
     * Display a specific tour in JSON format (API endpoint).
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function getTourData($id)
    {
        $tour = $this->tourStudioService->getTour($id);
        return response()->json($tour);
    }

    /**
     * Update a specific tour.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        return $this->tourStudioService->updateTour($request, $id);
    }

    /**
     * Delete a specific tour.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        return $this->tourStudioService->deleteTour($id);
    }
}
