<?php

namespace App\Models\Tour;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class TourNode extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia;

    protected $fillable = [
        'virtual_tour_id',
        'name',
        'caption',
        'panorama_path',
        'thumbnail_path',
        'gps',
        'sphere_correction',
        'start_node',
    ];

    protected $casts = [
        'gps' => 'array',
        'sphere_correction' => 'array',
        'start_node' => 'boolean',
    ];

    public function tour()
    {
        return $this->belongsTo(VirtualTour::class, 'virtual_tour_id');
    }

    public function links()
    {
        return $this->hasMany(TourLink::class, 'from_node_id');
    }

    public function fromLinks()
    {
        return $this->hasMany(TourLink::class, 'from_node_id');
    }

    public function toLinks()
    {
        return $this->hasMany(TourLink::class, 'to_node_id');
    }

    public function markers()
    {
        return $this->hasMany(TourNodeMarker::class, 'tour_node_id');
    }

    /**
     * Get all polygons for this node.
     */
    public function polygons()
    {
        return $this->hasMany(TourPolygon::class, 'tour_node_id');
    }

    /**
     * Get all text elements for this node.
     */
    public function texts()
    {
        return $this->hasMany(TourText::class, 'tour_node_id');
    }

    /**
     * Get all links to other nodes from this node's markers.
     */
    public function markerLinks()
    {
        return $this->markers()->where('is_link', true);
    }

    /**
     * Get all links to other nodes from this node's polygons.
     */
    public function polygonLinks()
    {
        return $this->polygons()->where('is_link', true);
    }

    /**
     * Get all links to other nodes from this node's text elements.
     */
    public function textLinks()
    {
        return $this->texts()->where('is_link', true);
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('panoramas')
            ->singleFile();
        // $this->addMediaCollection('thumbnails')
        //     ->singleFile();
    }

    public function registerMediaConversions(?Media  $media = null): void
    {
        // $this->addMediaConversion('thumb')
        //     ->width(368)
        //     ->height(276);
        $this->addMediaConversion('thumb')
            ->width(200)  // Thumbnail width
            ->height(200) // Thumbnail height
            ->sharpen(10); // Optional: sharpen the image
    }



    // public function registerMediaConversions(?Media $media = null): void
    // {
    //     $this->addMediaConversion('thumb')
    //         ->width(368)
    //         ->height(276);
    // }
}
