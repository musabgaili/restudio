<?php

namespace App\Services;

use App\Models\Project;
use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;

class ProjectService
{
    use LogsActivity;

    public function getAllProjects(): Collection
    {
        return Project::with(['blocks', 'blocks.properties'])->get();
    }

    public function getProjectById(int $id): Project
    {
        return Project::with(['blocks', 'blocks.properties'])->findOrFail($id);
    }

    public function createProject(array $data): Project
    {
        $project = Project::create($data);
        $this->logModelCreated("Created new project: {$project->name}");
        return $project;
    }

    public function updateProject(Project $project, array $data): Project
    {
        $project->update($data);
        $this->logModelUpdated("Updated project: {$project->name}");
        return $project;
    }

    public function uploadProjectMedia(Project $project, UploadedFile $file, string $collectionName): void
    {
        $project->uploadMedia($file, $collectionName);
        $this->logMediaUploaded("Uploaded media to project: {$project->name}", $project);
    }

    public function deleteProject(Project $project): void
    {
        $project->delete();
        $this->logModelDeleted("Deleted project: {$project->name}");
    }
}
