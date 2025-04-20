<?php

namespace App\Services;

use App\Models\Lead;
use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Collection;

class LeadService
{
    use LogsActivity;

    public function getAllLeads(): Collection
    {
        return Lead::with('agent')->get();
    }

    public function getLeadById(int $id): Lead
    {
        return Lead::with('agent')->findOrFail($id);
    }

    public function createLead(array $data): Lead
    {
        $lead = Lead::create($data);
        $this->logModelCreated("Created new lead: {$lead->name}");
        return $lead;
    }

    public function updateLead(Lead $lead, array $data): Lead
    {
        $lead->update($data);
        $this->logModelUpdated("Updated lead: {$lead->name}");
        return $lead;
    }

    public function assignLead(Lead $lead, int $agentId): Lead
    {
        $lead->update(['assigned_agent_id' => $agentId]);
        $this->logModelUpdated("Assigned lead {$lead->name} to agent ID: {$agentId}");
        return $lead;
    }

    public function updateLeadStatus(Lead $lead, string $status): Lead
    {
        $lead->update(['status' => $status]);
        $this->logModelUpdated("Updated lead {$lead->name} status to: {$status}");
        return $lead;
    }
}
