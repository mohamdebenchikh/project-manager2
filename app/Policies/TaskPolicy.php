<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class TaskPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Task $task): bool
    {
        return $user->currentTeam->id === $task->team_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Task $task): bool
    {
        return $user->currentTeam->id === $task->team_id &&
            ($task->user_id === $user->id || // creator
             $task->assignees->contains($user) || // assignee
             $task->team->owner_id === $user->id || // team owner
             $task->team->members()->where('user_id', $user->id)->where('role', 'admin')->exists()); // team admin
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Task $task): bool
    {
        return $user->currentTeam->id === $task->team_id &&
            ($task->user_id === $user->id || // creator
             $task->team->owner_id === $user->id || // team owner
             $task->team->members()->where('user_id', $user->id)->where('role', 'admin')->exists()); // team admin
    }
}
