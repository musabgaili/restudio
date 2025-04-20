<?php

namespace App\Models\Media;

use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use App\Models\Sales\Property;
use App\Traits\HasMediaUploads;
class PropertyMedia extends Model implements HasMedia
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
        $this->addMediaCollection('property_media');
    }
}
