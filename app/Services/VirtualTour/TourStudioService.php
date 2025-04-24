<?php

namespace App\Services\VirtualTour;

use App\Models\Tour\VirtualTour;
use App\Models\Tour\TourNode;
use App\Models\Tour\TourNodeMarker;
use App\Models\Tour\TourPolygon;
use App\Models\Tour\TourText;
use App\Models\Tour\TourLink;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class TourStudioService
{

    public function getAllTours()
    {
        return VirtualTour::all();
    }

    /**
     * Get a specific tour with all its related data.
     *
     * @param int $id
     * @return VirtualTour
     */
    public function getTour($id)
    {
        return VirtualTour::with([
            'nodes',
            'nodes.media',
            'nodes.markers',
            'nodes.polygons',
            'nodes.texts',
            'nodes.fromLinks',
            'nodes.toLinks'
        ])->findOrFail($id);
    }

    /**
     * Update an existing tour.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateTour(Request $request, $id)
    {
        Log::info('Updating tour:', ['tour_id' => $id, 'request' => $request->all()]);

        $tour = VirtualTour::findOrFail($id);

        // Update tour basic info
        $tour->update([
            'name' => $request->input('name', $tour->name),
            'description' => $request->input('description', $tour->description)
        ]);

        // Handle the rest of the update logic
        // For a complete implementation, you would need to handle updates to nodes, polygons, texts, markers, etc.

        return response()->json([
            'success' => true,
            'tour_id' => $tour->id,
            'message' => 'Tour updated successfully'
        ]);
    }

    /**
     * Delete a tour and all its related data.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteTour($id)
    {
        Log::info('Deleting tour:', ['tour_id' => $id]);

        $tour = VirtualTour::findOrFail($id);
        $tour->delete();

        return response()->json([
            'success' => true,
            'message' => 'Tour deleted successfully'
        ]);
    }
}
