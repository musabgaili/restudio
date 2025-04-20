<?php

namespace App\Traits;

use Illuminate\Http\UploadedFile;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

trait HasMediaUploads
{
    public function uploadMedia(UploadedFile $file, string $collectionName, array $customProperties = []): Media
    {
        return $this->addMedia($file)
            ->withCustomProperties($customProperties)
            ->toMediaCollection($collectionName);
    }

    public function uploadMultipleMedia(array $files, string $collectionName, array $customProperties = []): array
    {
        $mediaItems = [];
        foreach ($files as $file) {
            $mediaItems[] = $this->uploadMedia($file, $collectionName, $customProperties);
        }
        return $mediaItems;
    }

    public function deleteMediaItem(Media $media): void
    {
        $media->delete();
    }

    public function clearTheMediaCollection(string $collectionName): void
    {
        $this->clearMediaCollection($collectionName);
    }
}
