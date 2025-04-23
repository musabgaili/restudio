<?php

namespace App\Models\Tour;

use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class TourNode extends Model implements HasMedia
{
    use InteractsWithMedia;

    protected $guarded = [];

    public function virtualTour()
    {
        return $this->belongsTo(VirtualTour::class);
    }

    public function links()
    {
        return $this->hasMany(TourLink::class, 'from_node_id');
    }

    public function markers()
    {
        return $this->hasMany(TourNodeMarker::class, 'tour_node_id');
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
