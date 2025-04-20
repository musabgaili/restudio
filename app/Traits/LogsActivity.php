<?php

namespace App\Traits;

use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Model;

trait LogsActivity
{
    public function logActivity(string $action, string $description, ?Model $model = null): ActivityLog
    {
        return ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => $action,
            'description' => $description,
            'model_type' => $model ? get_class($model) : get_class($this),
            'model_id' => $model ? $model->id : $this->id,
        ]);
    }

    public function logModelCreated(string $description): ActivityLog
    {
        return $this->logActivity('created', $description);
    }

    public function logModelUpdated(string $description): ActivityLog
    {
        return $this->logActivity('updated', $description);
    }

    public function logModelDeleted(string $description): ActivityLog
    {
        return $this->logActivity('deleted', $description);
    }

    public function logMediaUploaded(string $description, Model $model): ActivityLog
    {
        return $this->logActivity('media_uploaded', $description, $model);
    }
}
