<?php

namespace App\Services;

use App\Models\Sales\Property;
use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;

class PropertyService
{
    use LogsActivity;

    public function getAllProperties(): Collection
    {
        return Property::with(['block', 'block.project'])->get();
    }

    public function getPropertyById(int $id): Property
    {
        return Property::with(['block', 'block.project'])->findOrFail($id);
    }

    public function createProperty(array $data): Property
    {
        $property = Property::create($data);
        $this->logModelCreated("Created new property: {$property->name}");
        return $property;
    }

    public function updateProperty(Property $property, array $data): Property
    {
        $property->update($data);
        $this->logModelUpdated("Updated property: {$property->name}");
        return $property;
    }

    public function uploadPropertyMedia(Property $property, UploadedFile $file, string $collectionName): void
    {
        $property->uploadMedia($file, $collectionName);
        $this->logMediaUploaded("Uploaded media to property: {$property->name}", $property);
    }

    public function updateVirtualTour(Property $property, string $virtualTourLink): Property
    {
        $property->update(['virtual_tour_link' => $virtualTourLink]);
        $this->logModelUpdated("Updated virtual tour for property: {$property->name}");
        return $property;
    }

    public function deleteProperty(Property $property): void
    {
        $property->delete();
        $this->logModelDeleted("Deleted property: {$property->name}");
    }
}
