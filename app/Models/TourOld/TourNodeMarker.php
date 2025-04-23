<?php

namespace App\Models\Tour;

use Illuminate\Database\Eloquent\Model;

// app/Models/TourNodeMarker.php
class TourNodeMarker extends Model
{
    protected $fillable = [
        'tour_node_id',
        'type',
        'label',
        'position',
        'target_node_id',
    ];

    protected $casts = [
        'position' => 'array',
    ];

    public function node()
    {
        return $this->belongsTo(TourNode::class, 'tour_node_id');
    }

    public function targetNode()
    {
        return $this->belongsTo(TourNode::class, 'target_node_id');
    }
}
