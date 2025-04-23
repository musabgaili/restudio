<?php

namespace App\Models\Tour;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TourPolygon extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'tour_node_id',
        'client_id',
        'points',
        'color',
        'stroke_width',
        'fill',
        'opacity',
        'is_link',
        'target_node_id',
        'data',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'fill' => 'boolean',
        'opacity' => 'float',
        'is_link' => 'boolean',
        'points' => 'array',
        'data' => 'array',
    ];

    /**
     * Get the node that owns the polygon.
     */
    public function node()
    {
        return $this->belongsTo(TourNode::class, 'tour_node_id');
    }

    /**
     * Get the target node if this polygon is a link.
     */
    public function targetNode()
    {
        return $this->belongsTo(TourNode::class, 'target_node_id');
    }
}
