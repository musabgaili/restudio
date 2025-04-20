<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Sales\Property;

class PropertyController extends Controller
{
    public function index()
    {
        $properties = Property::all();
        return view('sales.properties', compact('properties'));
    }

    public function show(Property $property)
    {
        return view('sales.property', compact('property'));
    }

    public function search(Request $request)
    {
        $properties = Property::where('name', 'like', '%' . $request->search . '%')
            ->orWhere('block_number', 'like', '%' . $request->search . '%')
            ->get();
        return view('sales.properties', compact('properties'));
    }

    public function getPropertyDetails(Property $property)
    {
        return response()->json([
            'property' => $property,
            'payments' => $property->payments()->with('media')->get(),
            'media' => $property->propertyMedia()->with('media')->get(),
            'virtual_tours' => $property->virtualTours()->with('media')->get()
        ]);
    }

    public function getPropertyPayments(Property $property)
    {
        return response()->json($property->payments()->with('media')->get());
    }

    public function getPropertyMedia(Property $property)
    {
        return response()->json($property->propertyMedia()->with('media')->get());
    }

    public function getPropertyVirtualTours(Property $property)
    {
        return response()->json($property->virtualTours()->with('media')->get());
    }

    public function getAllProperties()
    {
        $properties = Property::with(['propertyMedia', 'payments', 'virtualTours'])->get();
        return response()->json($properties);
    }
}
