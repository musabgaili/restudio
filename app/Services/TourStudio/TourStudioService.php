<?php

namespace App\Services\TourStudio;

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
    /**
     * Create a new virtual tour with nodes, markers, polygons, and text elements.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function createTour(Request $request)
    {
        Log::info('Creating new tour with request data:', ['request' => $request->all()]);

        // Create the tour record
        $tour = VirtualTour::create([
            'name' => $request->input('name', 'Untitled Tour'),
            'slug' => Str::slug($request->input('name', 'Untitled Tour')) . '-' . Str::random(5),
            'description' => $request->input('description', '')
        ]);

        // First pass: create nodes and capture temp_id => real_id mapping
        $nodeIdMap = $this->createNodes($request, $tour);

        // Log the node mapping for debugging
        Log::info('Node ID mapping:', ['mapping' => $nodeIdMap]);

        // Second pass: create polygons, texts, and markers
        $this->createPolygons($request, $nodeIdMap, $tour);
        $this->createTexts($request, $nodeIdMap, $tour);
        $this->createMarkers($request, $nodeIdMap, $tour);

        // Create links between nodes
        $this->createLinks($request, $nodeIdMap, $tour);

        Log::info('Tour created successfully', ['tour_id' => $tour->id]);

        return response()->json([
            'success' => true,
            'tour_id' => $tour->id,
            'message' => 'Tour created successfully'
        ]);
    }

    /**
     * Create nodes for the tour and return mapping of temp IDs to real IDs.
     *
     * @param Request $request
     * @param VirtualTour $tour
     * @return array temp_id => db_id
     */
    public function createNodes(Request $request, VirtualTour $tour)
    {
        Log::info('Creating nodes for tour:', ['tour_id' => $tour->id]);

        $nodes = $request->input('nodes', []);
        $panoramas = $request->file('panoramas', []);

        // Initialize a map to track temp IDs to real node IDs
        $tempToRealNodeIdMap = [];

        foreach ($nodes as $index => $nodeData) {
            Log::info('Processing node:', ['node_data' => $nodeData]);

            // Create the node with the data
            $node = new TourNode([
                'virtual_tour_id' => $tour->id,
                'name' => $nodeData['name'],
                'caption' => $nodeData['caption'] ?? null,
                'start_node' => isset($nodeData['start_node']) && $nodeData['start_node'] === true,
                'gps' => isset($nodeData['gps']) ? json_encode($nodeData['gps']) : null,
                'sphere_correction' => isset($nodeData['sphere_correction']) ? json_encode($nodeData['sphere_correction']) : null,
            ]);

            $node->save();

            // Save the temp-to-real ID mapping (temp ID => real ID)
            $tempToRealNodeIdMap[$nodeData['id']] = $node->id;

            // Attach the image if exists
            if (isset($panoramas[$index])) {
                $file = $panoramas[$index];
                $path = $file->store('panoramas', 'public');
                $node->panorama_path = $path;
                $node->save();

                // Generate thumbnail
                $this->generateThumbnail($file, $node);
            }
        }

        return $tempToRealNodeIdMap;
    }

    /**
     * Generate a thumbnail for the panorama.
     *
     * @param \Illuminate\Http\UploadedFile $file
     * @param TourNode $node
     * @return void
     */
    private function generateThumbnail($file, TourNode $node)
    {
        try {
            $thumbnailPath = 'thumbnails/' . basename($node->panorama_path);
            // Here you would use an image library like Intervention Image
            // For now, just storing the path
            $node->thumbnail_path = $thumbnailPath;
            $node->save();
        } catch (\Exception $e) {
            Log::error('Failed to generate thumbnail:', ['error' => $e->getMessage()]);
        }
    }

    /**
     * Create polygons for the tour nodes.
     *
     * @param Request $request
     * @param array $nodeIdMap
     * @param VirtualTour $tour
     * @return void
     */
    public function createPolygons(Request $request, array $nodeIdMap, VirtualTour $tour)
    {
        Log::info('Creating polygons for tour:', ['tour_id' => $tour->id]);

        $polygons = $request->input('polygons', []);

        foreach ($polygons as $polygonData) {
            // Get the real node ID
            if (!isset($polygonData['node_id']) || !isset($nodeIdMap[$polygonData['node_id']])) {
                Log::warning('Invalid node ID for polygon:', ['polygon_data' => $polygonData]);
                continue;
            }

            $nodeId = $nodeIdMap[$polygonData['node_id']];

            // Log polygon points for debugging
            Log::info('Polygon points:', ['points' => $polygonData['points']]);

            // Create the polygon
            $polygon = new TourPolygon([
                'tour_node_id' => $nodeId,
                'client_id' => $polygonData['id'] ?? null,
                'points' => json_encode($polygonData['points']),
                'color' => $polygonData['color'] ?? '#ff0000',
                'stroke_width' => $polygonData['stroke_width'] ?? 2,
                'fill' => $polygonData['fill'] ?? true,
                'opacity' => $polygonData['opacity'] ?? 0.5,
                'is_link' => isset($polygonData['target_node_id']),
                'target_node_id' => isset($polygonData['target_node_id']) ? $nodeIdMap[$polygonData['target_node_id']] : null,
                'data' => isset($polygonData['data']) ? json_encode($polygonData['data']) : null,
            ]);

            $polygon->save();
        }
    }

    /**
     * Create text elements for the tour nodes.
     *
     * @param Request $request
     * @param array $nodeIdMap
     * @param VirtualTour $tour
     * @return void
     */
    public function createTexts(Request $request, array $nodeIdMap, VirtualTour $tour)
    {
        Log::info('Creating texts for tour:', ['tour_id' => $tour->id]);

        $texts = $request->input('texts', []);

        foreach ($texts as $textData) {
            // Get the real node ID
            if (!isset($textData['node_id']) || !isset($nodeIdMap[$textData['node_id']])) {
                Log::warning('Invalid node ID for text:', ['text_data' => $textData]);
                continue;
            }

            $nodeId = $nodeIdMap[$textData['node_id']];

            // Log text data for debugging
            Log::info('Text data:', ['text' => $textData]);

            // Create the text element
            $text = new TourText([
                'tour_node_id' => $nodeId,
                'client_id' => $textData['id'] ?? null,
                'content' => $textData['content'],
                'position' => json_encode($textData['position']),
                'font_family' => $textData['font_family'] ?? 'Arial',
                'font_size' => $textData['font_size'] ?? 16,
                'font_weight' => $textData['font_weight'] ?? 'normal',
                'text_color' => $textData['text_color'] ?? '#ffffff',
                'background_color' => $textData['background_color'] ?? null,
                'transparent_background' => $textData['transparent_background'] ?? true,
                'rotation' => $textData['rotation'] ?? 0,
                'is_link' => isset($textData['target_node_id']),
                'target_node_id' => isset($textData['target_node_id']) ? $nodeIdMap[$textData['target_node_id']] : null,
                'styles' => isset($textData['styles']) ? json_encode($textData['styles']) : null,
            ]);

            $text->save();
        }
    }

    /**
     * Create markers for the tour nodes.
     *
     * @param Request $request
     * @param array $nodeIdMap
     * @param VirtualTour $tour
     * @return void
     */
    public function createMarkers(Request $request, array $nodeIdMap, VirtualTour $tour)
    {
        Log::info('Creating markers for tour:', ['tour_id' => $tour->id]);

        $markers = $request->input('markers', []);

        foreach ($markers as $markerData) {
            // Get the real node ID
            if (!isset($markerData['node_id']) || !isset($nodeIdMap[$markerData['node_id']])) {
                Log::warning('Invalid node ID for marker:', ['marker_data' => $markerData]);
                continue;
            }

            $nodeId = $nodeIdMap[$markerData['node_id']];

            // Log marker data for debugging
            Log::info('Marker data:', ['marker' => $markerData]);

            // Create the marker
            $marker = new TourNodeMarker([
                'tour_node_id' => $nodeId,
                'type' => $markerData['type'] ?? 'link',
                'label' => $markerData['label'] ?? null,
                'position' => json_encode($markerData['position']),
                'is_link' => isset($markerData['target_node_id']),
                'target_node_id' => isset($markerData['target_node_id']) ? $nodeIdMap[$markerData['target_node_id']] : null,
                'data' => isset($markerData['data']) ? json_encode($markerData['data']) : null,
            ]);

            $marker->save();
        }
    }

    /**
     * Create explicit links between nodes.
     *
     * @param Request $request
     * @param array $nodeIdMap
     * @param VirtualTour $tour
     * @return void
     */
    public function createLinks(Request $request, array $nodeIdMap, VirtualTour $tour)
    {
        Log::info('Creating explicit links for tour:', ['tour_id' => $tour->id]);

        $links = $request->input('links', []);

        foreach ($links as $linkData) {
            // Get the real node IDs
            if (!isset($linkData['from_node_id']) || !isset($nodeIdMap[$linkData['from_node_id']]) ||
                !isset($linkData['to_node_id']) || !isset($nodeIdMap[$linkData['to_node_id']])) {
                Log::warning('Invalid node ID for link:', ['link_data' => $linkData]);
                continue;
            }

            $fromNodeId = $nodeIdMap[$linkData['from_node_id']];
            $toNodeId = $nodeIdMap[$linkData['to_node_id']];

            // Log link data for debugging
            Log::info('Link data:', ['from' => $fromNodeId, 'to' => $toNodeId, 'type' => $linkData['link_type'] ?? 'marker']);

            // Create the link
            $link = new TourLink([
                'from_node_id' => $fromNodeId,
                'to_node_id' => $toNodeId,
                'link_type' => $linkData['link_type'] ?? 'marker',
                'element_id' => $linkData['element_id'] ?? null,
            ]);

            $link->save();
        }
    }

    /**
     * List all tours.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
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
