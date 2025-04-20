<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Sales\Property;
class HomeController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth')->except('properties');
    }

    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Contracts\Support\Renderable
     */
    public function index()
    {
        return view('home');
    }

    public function properties()
    {
        $properties = Property::all();
        return view('sales.properties', ['properties' => $properties]);
    }
}
