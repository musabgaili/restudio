<?php

namespace App\Models\Tour;

use Illuminate\Database\Eloquent\Model;

class TourNode extends Model
{
    protected $guarded = [];

    public function virtualTour()
    {
        return $this->belongsTo(VirtualTour::class);
    }
}
