<?php

namespace App\Http\Controllers;

use App\Http\Requests\InviteTeamMemberRequest;
use App\Mail\TeamInvitationMail;
use App\Models\Team;
use App\Models\User;
use App\Models\TeamInvitation;
use App\Notifications\TeamInvitation as TeamInvitationNotification;
use App\Notifications\TeamInvitationCancelled;
use App\Notifications\TeamMemberAdded;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Inertia\Inertia;

class TeamInvitationController extends Controller
{
    /**
     * Maximum number of invitations a user can send per hour
     */
    const HOURLY_INVITATION_LIMIT = 20;

    public function search(Request $request)
    {
        $query = $request->input('query');

        $team = $request->user()->currentTeam;
        return User::where(function ($q) use ($query) {
            $q->where('email', 'like', "%{$query}%")
                ->orWhere('name', 'like', "%{$query}%");
        })
            ->whereNotIn('id', function ($q) use ($team) {
                $q->select('user_id')
                    ->from('team_members')
                    ->where('team_id', $team->id);
            })
            ->whereNotIn('email', function ($q) use ($team) {
                $q->select('email')
                    ->from('team_invitations')
                    ->where('team_id', $team->id);
            })
            ->limit(5)
            ->get(['id', 'name', 'email', 'avatar']);
    }

    public function invite(InviteTeamMemberRequest $request, Team $team)
    {
        Gate::authorize('manage-team', $team);

        $validated = $request->validated();
        $email = $validated['email'];
        $role = $validated['role'] ?? 'member'; // Set default role to 'member' if not provided

        // Check rate limiting
        $key = 'team_invitations.' . $request->user()->id;
        if (RateLimiter::tooManyAttempts($key, self::HOURLY_INVITATION_LIMIT)) {
            $seconds = RateLimiter::availableIn($key);
            return redirect()->to(route('teams.invitations.index', $team))
                ->withErrors(['email' => "Too many invitations. Please try again in {$seconds} seconds."]);
        }

        // Check if user is already a member
        if ($team->members()
            ->whereIn('user_id', User::where('email', $email)->pluck('id'))
            ->exists()
        ) {
            return redirect()->back()
                ->withErrors(['email' => 'This user is already a member of the team.']);
        }

        // Check for pending invitation
        $existingInvitation = $team->invitations()
            ->where('email', $email)
            ->where('status', 'pending')
            ->first();

        if ($existingInvitation) {
            return redirect()->back()
                ->withErrors(['email' => 'An invitation has already been sent to this email.']);
        }

        // Check team member limit for non-personal teams
        if (!$team->personal_team) {
            $currentMemberCount = $team->members()->count();
            $pendingInvitesCount = $team->invitations()->where('status', 'pending')->count();
            $maxMembers = config('teams.max_members', 10);

            if (($currentMemberCount + $pendingInvitesCount + 1) > $maxMembers) {
                return redirect()->back()
                    ->withErrors(['email' => 'Team has reached maximum member capacity.']);
            }
        }

        // Create invitation
        $invitation = $team->invitations()->create([
            'email' => $email,
            'role' => $role,
            'token' => Str::random(64),
            'expires_at' => now()->addDays(7),
            'invited_by' => $request->user()->id,
            'status' => 'pending'
        ]);

        // Send invitation email
        Mail::to($email)->send(new TeamInvitationMail($invitation));
        RateLimiter::hit($key);

        // Send notification to user if they exist
        if ($inviteeUser = $invitation->invitee()) {
            $inviteeUser->notify(new TeamInvitationNotification($team, $invitation));
        }

        return redirect()->back()
            ->with('success', 'Invitation sent successfully.');
    }


    public function accept(Request $request, string $token)
    {
        try {
            // Get invitation
            $invitation = TeamInvitation::where('token', $token)
                ->where('status', 'pending')
                ->firstOrFail();

            // Check if invitation is for the current user
            if ($invitation->email !== $request->user()->email) {
                return redirect()->back()
                    ->withErrors(['error' => 'This invitation was not meant for you.']);
            }

            // Check if invitation has expired
            if ($invitation->expires_at->isPast()) {
                $invitation->update(['status' => 'expired']);
                return redirect()->back()
                    ->withErrors(['error' => 'This invitation has expired.']);
            }

            // Add user to team
            $team = $invitation->team;
            if (!$team) {
                \Log::error('Team not found for invitation', ['invitation_id' => $invitation->id]);
                return redirect()->back()
                    ->withErrors(['error' => 'Team not found']);
            }

            $team->addMember($request->user(), $invitation->role);


            // Mark invitation as accepted
            $invitation->update(['status' => 'accepted']);

            // Delete the notification
            $request->user()->notifications()
                ->where('data->invitation_token', $token)
                ->delete();

            // Notify team owner and admins
            $teamAdmins = $team->members()
                ->whereIn('role', ['admin'])
                ->get();

            foreach ($teamAdmins as $admin) {
                $admin->notify(new TeamMemberAdded(
                    $team,
                    $request->user(),
                    $invitation->role
                ));
            }

            return redirect()->back()
                ->with('success', "You have successfully joined {$team->name}!");

        } catch (\Exception $e) {
            return redirect()->back()
                ->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function decline(Request $request, $token)
    {
        try {
            $invitation = TeamInvitation::where('token', $token)
                ->where('status', 'pending')
                ->firstOrFail();

            // Delete the notification
            $request->user()->notifications()
                ->where('data->invitation_token', $token)
                ->delete();

            // Update invitation status to declined
            $invitation->update(['status' => 'declined']);

            // Find and notify the invitee if they exist
            if ($inviter = $invitation->inviter()) {
                $inviter->notify(new TeamInvitationCancelled($invitation->team));
            }

            return redirect()->back()
                ->with('success', 'Invitation declined successfully.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Cancel/delete a team invitation
     */
    public function destroy(Request $request, Team $team, TeamInvitation $invitation)
    {
        Gate::authorize('manage-team', $team);

        if ($invitation->team_id !== $team->id) {
            abort(404);
        }

        // Find and notify the invitee if they exist
        if ($invitee = $invitation->invitee()) {
            $invitee->notify(new TeamInvitationCancelled($team));
        }

        $invitation->delete();

        return redirect()->back()
            ->with('success', 'Invitation cancelled successfully.');
    }
}
