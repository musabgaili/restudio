<?php

namespace App\Models\Tour;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TourText extends Model
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
        'content',
        'position',
        'font_family',
        'font_size',
        'font_weight',
        'text_color',
        'background_color',
        'transparent_background',
        'rotation',
        'is_link',
        'target_node_id',
        'styles',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'transparent_background' => 'boolean',
        'rotation' => 'integer',
        'font_size' => 'integer',
        'is_link' => 'boolean',
        'position' => 'array',
        'styles' => 'array',
    ];

    /**
     * Get the node that owns the text element.
     */
    public function node()
    {
        return $this->belongsTo(TourNode::class, 'tour_node_id');
    }

    /**
     * Get the target node if this text is a link.
     */
    public function targetNode()
    {
        return $this->belongsTo(TourNode::class, 'target_node_id');
    }
}
