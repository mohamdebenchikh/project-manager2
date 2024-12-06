<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Team;
use Auth;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TeamControllerTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $personalTeam;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->personalTeam = Team::factory()->create([
            'owner_id' => $this->user->id,
            'personal_team' => true,
        ]);
        $this->user->current_team_id = $this->personalTeam->id;
        $this->user->save();
        $this->loginUser($this->user);
    }

    protected function loginUser($user)
    {
        Auth::login($user);
        return $this->actingAs(Auth::user());
    }

    protected function createTeam(array $attributes = [])
    {
        return Team::factory()->create(array_merge([
            'owner_id' => $this->user->id,
            'personal_team' => false,
        ], $attributes));
    }

    protected function createTeamMember($team, array $attributes = [])
    {
        $member = User::factory()->create();
        return $team->members()->create(array_merge([
            'user_id' => $member->id,
            'role' => 'member',
        ], $attributes));
    }

    public function test_user_can_create_team()
    {
        $response = $this->post('/teams', [
            'name' => 'Test Team',
            'description' => 'Test Description',
            'personal_team' => false,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('teams', [
            'name' => 'Test Team',
            'description' => 'Test Description',
        ]);
    }

    public function test_user_can_update_team()
    {
        $team = $this->createTeam();

        $response = $this->patch("/teams/{$team->id}", [
            'name' => 'Updated Team Name',
            'description' => 'Updated Description',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('teams', [
            'id' => $team->id,
            'name' => 'Updated Team Name',
            'description' => 'Updated Description',
        ]);
    }

    public function test_user_cannot_update_team_they_dont_own()
    {
        $otherUser = User::factory()->create();
        $team = Team::factory()->create([
            'owner_id' => $otherUser->id,
        ]);

        $response = $this->patch("/teams/{$team->id}", [
            'name' => 'Updated Team Name',
        ]);

        $response->assertStatus(403);
    }

    public function test_user_can_switch_teams()
    {
        $team1 = $this->createTeam();
        $team2 = $this->createTeam();

        $response = $this->post('/teams/switch', [
            'team_id' => $team2->id,
        ]);

        $response->assertRedirect();
        $this->assertEquals($team2->id, $this->user->fresh()->current_team_id);
    }

    public function test_user_can_update_team_member_role()
    {
        $team = $this->createTeam();
        $teamMember = $this->createTeamMember($team);

        $response = $this->patch("/teams/{$team->id}/members/{$teamMember->id}", [
            'role' => 'admin',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('team_members', [
            'id' => $teamMember->id,
            'role' => 'admin',
        ]);
    }

    public function test_user_can_remove_team_member()
    {
        $team = $this->createTeam();
        $teamMember = $this->createTeamMember($team);

        $response = $this->delete("/teams/{$team->id}/members/{$teamMember->id}");

        $response->assertRedirect();
        $this->assertDatabaseMissing('team_members', [
            'id' => $teamMember->id,
        ]);
    }

    public function test_user_can_update_team_status()
    {
        $team = $this->createTeam(['active' => true]);

        $response = $this->patch("/teams/{$team->id}/status", [
            'active' => false,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('teams', [
            'id' => $team->id,
            'active' => false,
        ]);
    }

    public function test_user_can_delete_team()
    {
        $team = $this->createTeam();

        $response = $this->delete("/teams/{$team->id}");

        $response->assertRedirect();
        $this->assertDatabaseMissing('teams', ['id' => $team->id]);
        $this->assertDatabaseMissing('team_members', ['team_id' => $team->id]);
        $this->assertDatabaseMissing('team_invitations', ['team_id' => $team->id]);
        $this->assertEquals($this->personalTeam->id, $this->user->fresh()->current_team_id);
    }
}
