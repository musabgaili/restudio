<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class VirtualTourController extends Controller
{
    public function virtualTourCreateView()
    {
        return view('virtual_tour.create');
    }
}
