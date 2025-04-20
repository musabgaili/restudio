<?php

namespace App\Models\Tour;

use Illuminate\Database\Eloquent\Model;

class VirtualTour extends Model
{

    protected $guarded = [];

    public function tourable()
    {
        return $this->morphTo();
    }

    public function nodes()
    {
        return $this->hasMany(TourNode::class);
    }

    public function links()
    {
        return $this->hasMany(TourLink::class);
    }


    public function markers()
    {
        return $this->hasMany(TourMarker::class);
    }
}
