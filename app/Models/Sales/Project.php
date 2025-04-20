<?php

namespace App\Models\Sales;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use App\Enums\Sales\ProjectStatus;

use MatanYadaev\EloquentSpatial\Objects\Polygon;
use MatanYadaev\EloquentSpatial\Traits\HasSpatial;

class Project extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia, HasSpatial;

    protected $guarded = ['id', 'created_at', 'updated_at'];
    protected $casts = [
        'status' => ProjectStatus::class,
        'shape' => Polygon::class,
    ];

    public function blocks()
    {
        return $this->hasMany(Block::class);
    }




    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('photos');
        $this->addMediaCollection('brochures');
        $this->addMediaCollection('documents');

        $this->addMediaCollection('virtual_tours');
    }
}
