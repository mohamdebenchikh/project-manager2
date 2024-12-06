<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Team;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    use RefreshDatabase;

    protected ?User $authUser = null;
    protected ?Team $userTeam = null;

    /**
     * Login a user and optionally create their personal team
     *
     * @param User|null $user
     * @param bool $createTeam
     * @param string $teamRole owner|admin|member
     * @return User
     */
    protected function loginUser(?User $user = null, bool $createTeam = true, string $teamRole = 'owner'): User
    {
        $this->authUser = $user ?? User::factory()->create();
        
        if ($createTeam) {
            if ($teamRole === 'owner') {
                $this->userTeam = Team::factory()->create([
                    'owner_id' => $this->authUser->id,
                    'name' => $this->authUser->name . "'s Team",
                    'personal_team' => true,
                ]);
            } else {
                // Create a team with a different owner
                $owner = User::factory()->create();
                $this->userTeam = Team::factory()->create([
                    'owner_id' => $owner->id,
                    'name' => $owner->name . "'s Team",
                    'personal_team' => false,
                ]);
                
                // Add the user as admin or member
                $this->userTeam->addMember($this->authUser, $teamRole);
            }
            
            $this->authUser->current_team_id = $this->userTeam->id;
            $this->authUser->save();
        }

        $this->actingAs($this->authUser);
        
        return $this->authUser;
    }

    /**
     * Create a team member with specified role
     *
     * @param Team $team
     * @param string $role admin|member
     * @param array $attributes
     * @return User
     */
    protected function createTeamMember(Team $team, string $role = 'member', array $attributes = []): User
    {
        $user = User::factory()->create($attributes);
        $team->addMember($user, $role);
        return $user;
    }

    /**
     * Get the currently authenticated user
     *
     * @return User|null
     */
    protected function getAuthUser(): ?User
    {
        return $this->authUser;
    }

    /**
     * Get the current team of the authenticated user
     *
     * @return Team|null
     */
    protected function getCurrentTeam(): ?Team
    {
        return $this->userTeam;
    }

    /**
     * Create a new team owned by the authenticated user
     *
     * @param array $attributes
     * @return Team
     */
    protected function createTeam(array $attributes = []): Team
    {
        return Team::factory()->create(array_merge([
            'owner_id' => $this->authUser->id,
            'personal_team' => false,
        ], $attributes));
    }

    /**
     * Get the team owner
     *
     * @return User|null
     */
    protected function getTeamOwner(): ?User
    {
        return $this->userTeam ? User::find($this->userTeam->owner_id) : null;
    }
}
