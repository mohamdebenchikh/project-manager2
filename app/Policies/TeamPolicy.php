<?php

namespace App\Policies;

use App\Models\Team;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class TeamPolicy
{
    use HandlesAuthorization;

    public function manageTeam(User $user, Team $team): bool
    {
        // Check if user is the team owner
        if ($team->owner_id === $user->id) {
            return true;
        }

        // Check if user is an admin member of the team
        return $team->members()
            ->where('user_id', $user->id)
            ->where('role', 'admin')
            ->exists();
    }
}
