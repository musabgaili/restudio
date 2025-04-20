<?php

namespace App\Models\Media;

use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use App\Models\Sales\Project;
use App\Traits\HasMediaUploads;
class NormalMedia extends Model implements HasMedia
{
        use InteractsWithMedia, HasMediaUploads;

    protected $fillable = [
        'project_id',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('normal_media');
    }
}
