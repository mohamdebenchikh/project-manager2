<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class ProjectPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any models.
     */
    public function viewAnyProject(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function viewProject(User $user, Project $project): bool
    {
        return $project->team_id === $user->current_team_id ||
            $project->team->owner_id === $user->id ||
            $project->team->members()->where('user_id', $user->id)->exists();
    }

    /**
     * Determine whether the user can create models.
     */
    public function createProject(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function updateProject(User $user, Project $project): bool
    {
        return $project->team_id === $user->current_team_id ||
            $project->team->owner_id === $user->id ||
            $project->team->members()->where('user_id', $user->id)->exists();
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function deleteProject(User $user, Project $project): bool
    {
        return $project->team_id === $user->current_team_id ||
            $project->team->owner_id === $user->id ||
            $project->team->members()->where('user_id', $user->id)->exists();
    }
}
