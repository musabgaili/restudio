<?php

namespace App\Models\Sales;

use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use App\Enums\Sales\Payemnt\{PayemntType,DepositType};
use App\Traits\HasMediaUploads;

class PropertyPayment extends Model implements HasMedia
{
    use InteractsWithMedia, HasMediaUploads;

    protected $guarded = ['id', 'created_at', 'updated_at'];
    protected $casts = [
        'payment_type' => PayemntType::class,
        'deposit_type' => DepositType::class,
    ];

    public function property()
    {
        return $this->belongsTo(Property::class);
    }


    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('payment_media');
    }
}
