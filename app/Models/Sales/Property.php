<?php

namespace App\Models\Sales;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use App\Enums\Sales\{PropertyStatus ,PropertyType};
use App\Models\Media\{PropertyMedia,PropertyVirtualMedia};
use MatanYadaev\EloquentSpatial\Objects\Polygon;
use MatanYadaev\EloquentSpatial\Traits\HasSpatial;
use App\Traits\TraitsPropertyMedia;

class Property extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia, HasSpatial, TraitsPropertyMedia;

    protected $guarded = ['id', 'created_at', 'updated_at'];
    protected $casts = [
        'price' => 'float',
        'area' => 'float',
        'bedrooms' => 'integer',
        'status' => PropertyStatus::class,
        'type' => PropertyType::class,
        'shape' => Polygon::class,
    ];




    public function block()
    {
        return $this->belongsTo(Block::class);
    }

    public function payments()
    {
        return $this->hasMany(PropertyPayment::class);
    }

    public function virtualTours()
    {
        return $this->hasMany(PropertyVirtualMedia::class);
    }

    public function propertyMedia()
    {
        return $this->hasMany(PropertyMedia::class);
    }



    public function registerMediaCollections(): void
    {
        // $this->addMediaCollection('photos');
        // $this->addMediaCollection('documents');
        $this->addMediaCollection('deed_file');
        // $this->addMediaCollection('virtual_tours');
    }
}
