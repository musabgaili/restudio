<?php

namespace App\Http\Controllers;

use App\Models\Tour\VirtualTour;
use App\Models\Tour\TourNode;
use App\Models\Tour\TourLink;
use App\Models\Tour\TourMarker;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
class VirtualTourControllerOld extends Controller
{
    public function virtualTourCreateView()
    {
        return view('virtual_tour.new');
    }

    // Save a new virtual tour
    public function save(Request $request)
    {
        logger($request->all());
        // Validate and save the virtual tour
        // $tour = VirtualTour::create($request->only(['name', 'slug', 'description']));
        $tour = VirtualTour::create([
            'name' => Str::random(5).uniqid().now()->millisecond.Str::random(5),
            'slug' => Str::random(5).uniqid().now()->millisecond.Str::random(5),
            'description' => Str::random(5).uniqid().now()->millisecond.Str::random(5)
        ]);

        // Handle media uploads
        // if ($request->hasFile('panoramas')) {
        //     foreach ($request->file('panoramas') as $panorama) {
        //         $tour->addMedia($panorama)->toMediaCollection('panoramas');
        //     }
        // }

        // TODO
        // create thumbnails

        // if ($request->hasFile('thumbnails')) {
        //     foreach ($request->file('thumbnails') as $thumbnail) {
        //         $tour->addMedia($thumbnail)->toMediaCollection('thumbnails');
        //     }
        // }

        // Save nodes
        foreach ($request->nodes as $nodeData) {
            // Create node without links and markers
            $nodeToCreate = array_diff_key($nodeData, ['links' => [], 'markers' => []]);
            // create without relation shit
            $node = new TourNode($nodeToCreate);
            $node->virtual_tour_id = $tour->id;
            $node->save();

            // Save panoramas
            if ($request->hasFile('panoramas')) {
                foreach ($request->file('panoramas') as $panorama) {
                    $node->addMedia($panorama)->toMediaCollection('panoramas');
                }
            }

            // $node = $tour->nodes()->create($nodeToCreate);


            // Save links
            if (isset($nodeData['links'])) {
                foreach ($nodeData['links'] as $linkData) {
                    TourLink::create([
                        'from_node_id' => $node->id,
                        'to_node_id' => $linkData['to_node_id']
                    ]);
                }
            }

            // Save markers
            if (isset($nodeData['markers'])) {
                foreach ($nodeData['markers'] as $markerData) {
                    TourMarker::create(array_merge(
                        $markerData,
                        ['node_id' => $node->id]
                    ));
                }
            }
        }

        return response()->json(['success' => true, 'tour_id' => $tour->id]);
    }

    // Load a virtual tour
    public function load($id)
    {
        $tour = VirtualTour::with(['nodes.links', 'nodes.markers'])->findOrFail($id);
        return response()->json($tour);
    }



    // public function createThumbnails($tour)
    // {
    //     $nodes = $tour->nodes;
    //     foreach ($nodes as $node) {
    //         $node->createThumbnail();
    //     }
    // }
}
