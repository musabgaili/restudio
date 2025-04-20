<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Lead extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'source',
        'notes',
        'status',
        'assigned_agent_id'
    ];

    protected $casts = [
        'status' => 'string'
    ];

    public function agent()
    {
        return $this->belongsTo(User::class, 'assigned_agent_id');
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('documents');
    }
}
