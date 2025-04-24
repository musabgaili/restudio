<?php

namespace App\Services\VirtualTour;

use App\Models\Tour\VirtualTour;
use App\Models\Tour\TourNode;
use App\Models\Tour\TourPolygon;
use App\Models\Tour\TourText;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TourDrawService
{
    /**
     * Get a specific tour with all its related data for drawing.
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
            'nodes.texts'
        ])->findOrFail($id);
    }

    /**
     * Get all drawings (polygons and texts) for a specific node.
     *
     * @param int $tourId
     * @param int $nodeId
     * @return array
     */
    public function getNodeDrawings($tourId, $nodeId)
    {
        // Verify the node belongs to the tour
        $node = TourNode::where('id', $nodeId)
            ->where('virtual_tour_id', $tourId)
            ->with(['polygons', 'texts'])
            ->firstOrFail();

        // Prepare the drawings data
        $drawings = [
            'polygons' => [],
            'texts' => []
        ];

        // Add polygon data
        foreach ($node->polygons as $polygon) {
            $drawings['polygons'][] = [
                'id' => $polygon->id,
                'points' => json_decode($polygon->points),
                'color' => $polygon->color,
                'opacity' => $polygon->opacity,
                'data' => json_decode($polygon->data)
            ];
        }

        // Add text data
        foreach ($node->texts as $text) {
            $drawings['texts'][] = [
                'id' => $text->id,
                'content' => $text->content,
                'position' => json_decode($text->position),
                'size' => $text->size,
                'color' => $text->color,
                'data' => json_decode($text->data)
            ];
        }

        return $drawings;
    }

    /**
     * Save drawings (polygons and texts) for a specific node.
     *
     * @param int $tourId
     * @param int $nodeId
     * @param array $polygons
     * @param array $texts
     * @return bool
     */
    public function saveNodeDrawings($tourId, $nodeId, array $polygons, array $texts)
    {
        try {
            // Verify the node belongs to the tour
            $node = TourNode::where('id', $nodeId)
                ->where('virtual_tour_id', $tourId)
                ->firstOrFail();

            // Begin transaction
            DB::beginTransaction();

            // First, delete all existing polygons and texts for this node
            $node->polygons()->delete();
            $node->texts()->delete();

            // Save new polygons
            foreach ($polygons as $polygon) {
                $node->polygons()->create([
                    'points' => json_encode($polygon['points'] ?? []),
                    'color' => $polygon['color'] ?? '#ff0000',
                    'opacity' => $polygon['opacity'] ?? 0.5,
                    'data' => json_encode($polygon['data'] ?? null)
                ]);
            }

            // Save new texts
            foreach ($texts as $text) {
                $node->texts()->create([
                    'content' => $text['content'] ?? '',
                    'position' => json_encode($text['position'] ?? []),
                    'size' => $text['size'] ?? 16,
                    'color' => $text['color'] ?? '#ffffff',
                    'data' => json_encode($text['data'] ?? null)
                ]);
            }

            // Commit transaction
            DB::commit();

            return true;
        } catch (\Exception $e) {
            // Rollback transaction on error
            DB::rollBack();

            Log::error('Error saving node drawings: ' . $e->getMessage(), [
                'tour_id' => $tourId,
                'node_id' => $nodeId,
                'exception' => $e
            ]);

            return false;
        }
    }
}
