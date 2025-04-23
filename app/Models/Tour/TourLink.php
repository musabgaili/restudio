<?php

namespace App\Models\Tour;

use Illuminate\Database\Eloquent\Model;

class TourLink extends Model
{
    protected $guarded = [];

    public function fromNode()
    {
        return $this->belongsTo(TourNode::class, 'from_node_id');
    }

    public function toNode()
    {
        return $this->belongsTo(TourNode::class, 'to_node_id');
    }

    public function virtualTour()
    {
        return $this->belongsTo(VirtualTour::class);
    }


}
