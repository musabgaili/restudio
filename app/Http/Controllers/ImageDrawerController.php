<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ImageDrawerController extends Controller
{
    public function imageDrawerCreateView()
    {
        // return view('image_drawer.create');
        return view('image_drawer.three');
    }

    public function index()
    {
        return view('image_drawer.index');
    }

    public function export()
    {
        // return view('image_drawer.export');
        // Storage::download()
        return response()->json([
            'message' => 'Exported successfully',
            'status' => 'success'
        ]);
    }
}
