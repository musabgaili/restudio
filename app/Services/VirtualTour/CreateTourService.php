<?php

namespace App\Services\VirtualTour;

use App\Models\Tour\VirtualTour;
use App\Models\Tour\TourNode;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CreateTourService
{
    /**
     * Create a new virtual tour and its related nodes and markers.
     */
    public function createTour(Request $request)
    {
        logger($request->all());

        // Create the tour record
        $tour = VirtualTour::create([
            'name' => Str::random(5) . uniqid() . now()->millisecond . Str::random(5),
            'slug' => Str::random(5) . uniqid() . now()->millisecond . Str::random(5),
            'description' => Str::random(5) . uniqid() . now()->millisecond . Str::random(5)
        ]);

        // First pass: create nodes and capture temp_id => real_id mapping
        $nodeIdMap = $this->createNodes($request, $tour);

        // Second pass: attach markers linking nodes via real DB IDs
        $this->attachMarkers($request, $nodeIdMap, $tour);

        return response()->json(['success' => true, 'tour_id' => $tour->id]);
    }

    /**
     * Create nodes for the tour and return mapping of temp IDs to real IDs.
     *
     * @return array temp_id => db_id
     */
    public function createNodes(Request $request, VirtualTour $tour)
    {
        $logNodes = [];
        $nodes = $request->input('nodes', []);
        $panoramas = $request->file('panoramas', []);

        // Initialize a map to track temp IDs to real node IDs
        $tempToRealNodeIdMap = [];

        // Log the node structure before processing
        logger("Processing nodes: " . json_encode($nodes));

        foreach ($nodes as $index => $nodeData) {
            // Log this node to debug
            logger("Processing node {$index}: " . json_encode($nodeData));

            // Create the node with the data
            $node = new TourNode([
                'virtual_tour_id' => $tour->id,
                'name' => $nodeData['name'],
                'caption' => $nodeData['caption'] ?? null,
                'start_node' => $nodeData['start_node'] === 'true',
                'gps' => json_decode($nodeData['gps'] ?? 'null', true),
                'sphere_correction' => json_decode($nodeData['sphere_correction'] ?? 'null', true),
            ]);

            $node->save();

            // Add to the logNodes array for later logging
            $logNodes[] = $node;

            // Save the temp-to-real ID mapping (temp ID => real ID)
            $tempToRealNodeIdMap[$nodeData['id']] = $node->id;

            // Log this mapping
            logger("Mapped temp ID {$nodeData['id']} to real DB ID {$node->id}");

            // Attach the image if exists
            if (isset($panoramas[$index])) {
                $node->addMedia($panoramas[$index])->toMediaCollection('panoramas');
            }
        }

        // Log the complete mapping after all nodes are processed
        logger("Complete node mapping: " . json_encode($tempToRealNodeIdMap));

        // Return the temp ID to real ID mapping
        return $tempToRealNodeIdMap;
    }


    /**
     * Attach markers to nodes, resolving each marker's target via the temp ID map.
     */
    public function attachMarkers(Request $request, array $nodeIdMap, VirtualTour $tour)
    {
        $nodes = $request->input('nodes', []);

        // Log nodeIdMap for debugging
        logger("Node ID mapping in attachMarkers: " . json_encode($nodeIdMap));

        foreach ($nodes as $nodeData) {
            // Log the raw marker data for debugging
            logger("Raw markers string for node {$nodeData['id']}: " . $nodeData['markers']);

            // Decode the markers from JSON
            $markers = json_decode($nodeData['markers'], true);

            // Log the decoded markers
            logger("Decoded markers for node {$nodeData['id']}: " . json_encode($markers));

            // Get the real DB ID for this node from our mapping
            $currentNodeRealId = $nodeIdMap[$nodeData['id']] ?? null;

            if (!$currentNodeRealId) {
                logger("Cannot find real ID for node: " . $nodeData['id']);
                continue;
            }

            // Get the node from the database
            $node = TourNode::find($currentNodeRealId);

            if (!$node) {
                logger("Node not found in database with ID: " . $currentNodeRealId);
                continue;
            }

            foreach ($markers as $marker) {
                // Log the complete marker structure
                logger("Processing marker: " . json_encode($marker));

                // Check if marker has data and targetNodeId
                if (!isset($marker['data']) || !isset($marker['data']['targetNodeId'])) {
                    logger("Marker missing data.targetNodeId structure");
                    continue;
                }

                $targetTempId = $marker['data']['targetNodeId'];
                logger("Target temp ID: " . $targetTempId);

                // Check if targetTempId is found in the map
                if ($targetTempId && isset($nodeIdMap[$targetTempId])) {
                    $targetRealId = $nodeIdMap[$targetTempId];

                    // Log this mapping for debugging
                    logger("Mapping marker target from temp ID {$targetTempId} to real ID {$targetRealId}");
                } else {
                    logger("Invalid marker target: temp ID {$targetTempId} not found in map");
                    logger("Available mapping keys: " . implode(', ', array_keys($nodeIdMap)));
                    $targetRealId = null; // Invalid target node
                }

                // Create marker in the database with the real target_node_id
                $node->markers()->create([
                    'type' => $marker['type'] ?? 'link',
                    'label' => $marker['label'] ?? null,
                    'position' => json_encode($marker['position']),
                    'target_node_id' => $targetRealId, // Use real ID here
                ]);
            }
        }
    }

}
