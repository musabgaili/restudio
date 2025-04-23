<?php

namespace App\Models\Tour;

use Illuminate\Database\Eloquent\Model;
// use Spatie\MediaLibrary\HasMedia;
// use Spatie\MediaLibrary\InteractsWithMedia;

class VirtualTour extends Model
{
    // use InteractsWithMedia;

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

    // public function registerMediaCollections(): void
    // {
    //     $this->addMediaCollection('panoramas')->useDisk('public');
    //     $this->addMediaCollection('thumbnails')->useDisk('public');
    // }
}
