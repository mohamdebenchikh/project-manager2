<?php

namespace App\Providers;

use App\Models\Team;
use App\Models\User;
use App\Models\Project;
use App\Models\Task;
use App\Policies\ProjectPolicy;
use App\Policies\TaskPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Project::class => ProjectPolicy::class,
        Task::class => TaskPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        Gate::define('manage-team', function (User $user, Team $team) {
            // Check if user is the owner
            if ($team->owner_id === $user->id) {
                return true;
            }

            // Check if user is an admin member
            return $team->members()
                ->where('user_id', $user->id)
                ->where('role', 'admin')
                ->exists();
        });
    }
}
