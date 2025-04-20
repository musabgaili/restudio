<?php

namespace App\Models\Sales;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use App\Enums\Sales\BlockStatus;
class Block extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia;

    // protected $fillable = [
    //     'name',
    //     'description',
    //     'project_id'
    // ];

    protected $guarded = ['id', 'created_at', 'updated_at'];
    protected $casts = [
        'status' => BlockStatus::class,
    ];


    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function properties()
    {
        return $this->hasMany(Property::class);
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('photos');
        $this->addMediaCollection('documents');
        $this->addMediaCollection('virtual_tours');
    }
}
