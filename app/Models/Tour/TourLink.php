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

}
