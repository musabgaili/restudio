<?php

namespace App\Models\Media;

use App\Models\Sales\Property;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use App\Traits\HasMediaUploads;


class PropertyVirtualMedia extends Model implements HasMedia
{
    use InteractsWithMedia, HasMediaUploads;

    protected $fillable = [
        'property_id',
    ];

    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('property_virtual_media');
    }
}
