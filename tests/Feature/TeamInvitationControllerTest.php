<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Team;
use App\Models\TeamInvitation;
use App\Notifications\TeamInvitationCancelled;
use App\Mail\TeamInvitationMail;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Mail;

class TeamInvitationControllerTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();
        Notification::fake();
    }

    /** @test */
    public function user_can_search_for_users_to_invite()
    {
        $this->loginUser();
        $searchUser = User::factory()->create(['name' => 'John Doe']);

        $response = $this->get('/users/search?query=John');

        $response->assertStatus(200)
            ->assertJsonFragment(['name' => 'John Doe']);
    }

    /** @test */
    public function team_owner_can_invite_member_to_team()
    {
        $user = $this->loginUser();
        $team = $this->getCurrentTeam();
        $inviteeEmail = 'test@example.com';

        $response = $this->post("/teams/{$team->id}/invitations", [
            'email' => $inviteeEmail,
            'role' => 'member'
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('team_invitations', [
            'team_id' => $team->id,
            'email' => $inviteeEmail,
            'role' => 'member',
            'status' => 'pending',
            'invited_by' => $user->id
        ]);
        
        Mail::assertSent(TeamInvitationMail::class);
    }

    /** @test */
    public function team_admin_can_invite_members()
    {
        $owner = User::factory()->create();
        $team = Team::factory()->create(['owner_id' => $owner->id]);
        $admin = $this->loginUser(null, false); // Don't create personal team
        $team->addMember($admin, 'admin');
        $admin->switchTeam($team);
        $this->userTeam = $team; // Set the current team

        $inviteeEmail = 'test@example.com';

        $response = $this->post("/teams/{$team->id}/invitations", [
            'email' => $inviteeEmail,
            'role' => 'member'
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('team_invitations', [
            'team_id' => $team->id,
            'email' => $inviteeEmail,
            'role' => 'member',
            'status' => 'pending',
            'invited_by' => $admin->id
        ]);
        
        Mail::assertSent(TeamInvitationMail::class);
    }

    /** @test */
    public function team_member_cannot_invite_others()
    {
        $owner = User::factory()->create();
        $team = Team::factory()->create(['owner_id' => $owner->id]);
        $member = $this->loginUser();
        $team->addMember($member, 'member');
        $member->switchTeam($team);

        $response = $this->post("/teams/{$team->id}/invitations", [
            'email' => 'test@example.com',
            'role' => 'member'
        ]);

        $response->assertForbidden();
        Mail::assertNotSent(TeamInvitationMail::class);
    }

    /** @test */
    public function team_admin_can_invite_admin()
    {
        $owner = User::factory()->create();
        $team = Team::factory()->create(['owner_id' => $owner->id]);
        $admin = $this->loginUser();
        $team->addMember($admin, 'admin');
        $admin->switchTeam($team);

        $inviteeEmail = 'test@example.com';

        $response = $this->post("/teams/{$team->id}/invitations", [
            'email' => $inviteeEmail,
            'role' => 'admin'
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('team_invitations', [
            'team_id' => $team->id,
            'email' => $inviteeEmail,
            'role' => 'admin',
            'status' => 'pending',
            'invited_by' => $admin->id
        ]);
        
        Mail::assertSent(TeamInvitationMail::class);
    }

    /** @test */
    public function cannot_invite_existing_team_member()
    {
        $owner = User::factory()->create();
        $team = Team::factory()->create(['owner_id' => $owner->id]);
        $admin = $this->loginUser();
        $team->addMember($admin, 'admin');
        $admin->switchTeam($team);

        $member = $this->createTeamMember($team);

        $response = $this->post("/teams/{$team->id}/invitations", [
            'email' => $member->email,
            'role' => 'member'
        ]);

        $response->assertSessionHasErrors('email');
        Mail::assertNotSent(TeamInvitationMail::class);
    }

    /** @test */
    public function guest_cannot_access_invitation_features()
    {
        $team = Team::factory()->create();
        
        $response = $this->post("/teams/{$team->id}/invitations", [
            'email' => 'test@example.com',
            'role' => 'member'
        ]);

        $response->assertRedirect('/login');
        Mail::assertNotSent(TeamInvitationMail::class);
    }

    /** @test */
    public function team_owner_can_send_bulk_invitations()
    {
        $user = $this->loginUser();
        $team = $this->getCurrentTeam();
        $emails = [
            'user1@example.com',
            'user2@example.com',
            'user3@example.com'
        ];

        $response = $this->post("/teams/{$team->id}/invitations/bulk", [
            'emails' => $emails,
            'role' => 'member'
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();
        
        foreach ($emails as $email) {
            $this->assertDatabaseHas('team_invitations', [
                'team_id' => $team->id,
                'email' => $email,
                'status' => 'pending',
                'invited_by' => $user->id,
                'role' => 'member'
            ]);
        }
    }

    /** @test */
    public function only_owner_can_delete_team()
    {
        // Test with admin
        $owner = User::factory()->create();
        $team = Team::factory()->create([
            'owner_id' => $owner->id,
            'personal_team' => false
        ]);
        $admin = $this->loginUser();
        $team->addMember($admin, 'admin');
        $admin->switchTeam($team);
        
        $response = $this->delete("/teams/{$team->id}");
        $response->assertForbidden();
        
        // Test with owner
        $owner = $this->loginUser();
        $team = Team::factory()->create([
            'owner_id' => $owner->id,
            'personal_team' => false,
            'name' => 'Test Team'
        ]);
        $owner->switchTeam($team);
        
        $response = $this->delete("/teams/{$team->id}");
        $response->assertRedirect();
        $this->assertDatabaseMissing('teams', ['id' => $team->id]);
    }

    /** @test */
    public function admin_can_manage_team_members()
    {
        $owner = User::factory()->create();
        $team = Team::factory()->create(['owner_id' => $owner->id]);
        $admin = $this->loginUser();
        $team->addMember($admin, 'admin');
        $admin->switchTeam($team);

        $otherUser = User::factory()->create();
        $member = $team->addMember($otherUser, 'member');

        // Admin can promote members
        $response = $this->patch("/teams/{$team->id}/members/{$member->id}", [
            'role' => 'admin'
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('team_members', [       
            'team_id' => $team->id,
            'user_id' => $otherUser->id,
            'role' => 'admin'
        ]);

        // Admin can remove members
        $response = $this->delete("/teams/{$team->id}/members/{$member->id}");
        
        $response->assertRedirect();
        $this->assertDatabaseMissing('team_members', [
            'team_id' => $team->id,
            'user_id' => $otherUser->id
        ]);
    }

    /** @test */
    public function member_cannot_manage_team_members()
    {
        $owner = User::factory()->create();
        $team = Team::factory()->create(['owner_id' => $owner->id]);
        $member = $this->loginUser();
        $team->addMember($member, 'member');
        $member->switchTeam($team);

        $otherUser = User::factory()->create();
        $otherMember = $team->addMember($otherUser, 'member');

        // Member cannot promote others
        $response = $this->patch("/teams/{$team->id}/members/{$otherMember->id}", [
            'role' => 'admin'
        ]);
        
        $response->assertForbidden();

        // Member cannot remove others
        $response = $this->delete("/teams/{$team->id}/members/{$otherMember->id}");
        
        $response->assertForbidden();
    }

    /** @test */
    public function admin_can_cancel_invitation()
    {
        $owner = User::factory()->create();
        $team = Team::factory()->create(['owner_id' => $owner->id]);
        $admin = $this->loginUser();
        $team->addMember($admin, 'admin');
        $admin->switchTeam($team);

        $invitation = TeamInvitation::factory()->create([
            'team_id' => $team->id,
            'email' => 'test@example.com',
            'status' => 'pending',
            'invited_by' => $admin->id
        ]);

        $invitee = User::factory()->create(['email' => 'test@example.com']);

        $response = $this->delete("/teams/{$team->id}/invitations/{$invitation->id}");

        $response->assertRedirect();
        $this->assertDatabaseMissing('team_invitations', ['id' => $invitation->id]);
        Notification::assertSentTo($invitee, TeamInvitationCancelled::class);
    }

    /** @test */
    public function admin_can_send_invitation_reminder()
    {
        $owner = User::factory()->create();
        $team = Team::factory()->create(['owner_id' => $owner->id]);
        $admin = $this->loginUser();
        $team->addMember($admin, 'admin');
        $admin->switchTeam($team);

        $invitation = TeamInvitation::factory()->create([
            'team_id' => $team->id,
            'email' => 'test@example.com',
            'status' => 'pending',
            'invited_by' => $admin->id,
            'reminder_count' => 0
        ]);

        $response = $this->post("/teams/{$team->id}/invitations/{$invitation->id}/remind");

        $response->assertRedirect();
        $this->assertDatabaseHas('team_invitations', [
            'id' => $invitation->id,
            'reminder_count' => 1
        ]);
        Mail::assertSent(TeamInvitationMail::class);
    }
}
