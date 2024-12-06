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
use Carbon\Carbon;

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
            ->get(['id', 'name', 'email']);
    }

    public function invite(InviteTeamMemberRequest $request, Team $team)
    {
        Gate::authorize('manage-team', $team);
        
        $validated = $request->validated();
        $email = $validated['email'];
        $role = $validated['role'];

        // Check rate limiting
        $key = 'team_invitations.' . $request->user()->id;
        if (RateLimiter::tooManyAttempts($key, self::HOURLY_INVITATION_LIMIT)) {
            $seconds = RateLimiter::availableIn($key);
            return back()->withErrors(['email' => "Too many invitations. Please try again in {$seconds} seconds."]);
        }

        // Check if user is already a member
        if ($team->members()->whereHas('user', function ($query) use ($email) {
            $query->where('email', $email);
        })->exists()) {
            return back()->withErrors(['email' => 'This user is already a member of the team.']);
        }

        // Check for pending invitation
        $existingInvitation = $team->invitations()
            ->where('email', $email)
            ->where('status', 'pending')
            ->first();

        if ($existingInvitation) {
            return back()->withErrors(['email' => 'An invitation has already been sent to this email.']);
        }

        // Check team member limit for non-personal teams
        if (!$team->personal_team) {
            $currentMemberCount = $team->members()->count();
            $pendingInvitesCount = $team->invitations()->where('status', 'pending')->count();
            $maxMembers = config('teams.max_members', 10);

            if (($currentMemberCount + $pendingInvitesCount + 1) > $maxMembers) {
                return back()->withErrors(['email' => 'Team has reached maximum member capacity.']);
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

        // Send notification to user
        if ($user = User::where('email', $email)->first()) {
            $user->notify(new TeamInvitationNotification($team,$invitation));
        }


        return back()->with('success', 'Invitation sent successfully.');
    }

    /**
     * Send bulk invitations to multiple email addresses
     */
    public function bulkInvite(Request $request, Team $team)
    {
        Gate::authorize('manage-team', $team);

        $validated = $request->validate([
            'emails' => ['required', 'array', 'min:1'],
            'emails.*' => ['required', 'email', 'max:255'],
            'role' => ['required', 'string', 'in:admin,member,viewer'],
        ]);

        // Check rate limiting
        $key = 'team_invitations.' . $request->user()->id;
        if (RateLimiter::tooManyAttempts($key, self::HOURLY_INVITATION_LIMIT)) {
            $seconds = RateLimiter::availableIn($key);
            return back()->withErrors(['limit' => "Too many invitations. Please try again in {$seconds} seconds."]);
        }

        // Check team member limit for non-personal teams
        if (!$team->personal_team) {
            $currentMemberCount = $team->members()->count();
            $pendingInvitesCount = $team->invitations()->where('status', 'pending')->count();
            $maxMembers = config('teams.max_members', 10);

            if (($currentMemberCount + $pendingInvitesCount + count($validated['emails'])) > $maxMembers) {
                return back()->withErrors(['limit' => 'Team has reached maximum member capacity.']);
            }
        }

        $successCount = 0;
        $errors = [];

        foreach ($validated['emails'] as $email) {
            // Check if user is already a member
            if ($team->members()->whereHas('user', function ($query) use ($email) {
                $query->where('email', $email);
            })->exists()) {
                $errors[] = "{$email} is already a member of the team.";
                continue;
            }

            // Check for pending invitation
            $existingInvitation = $team->invitations()
                ->where('email', $email)
                ->whereIn('status', ['pending', 'expired'])
                ->first();

            if ($existingInvitation) {
                if ($existingInvitation->status === 'expired') {
                    // Re-activate expired invitation
                    $existingInvitation->update([
                        'status' => 'pending',
                        'token' => Str::random(64),
                        'expires_at' => now()->addDays(7),
                        'reminder_count' => 0,
                        'reminder_sent_at' => null
                    ]);
                } else {
                    $errors[] = "An invitation has already been sent to {$email}.";
                    continue;
                }
            } else {
                // Create new invitation
                $invitation = $team->invitations()->create([
                    'email' => $email,
                    'role' => $validated['role'],
                    'token' => Str::random(64),
                    'expires_at' => now()->addDays(7),
                    'invited_by' => $request->user()->id,
                    'status' => 'pending'
                ]);

                // Send invitation email
                Mail::to($email)->send(new TeamInvitationMail($invitation));
                if($user = User::where('email', $email)->first()) {
                    $user->notify(new TeamInvitationNotification($team,$invitation));
                }
                
                $successCount++;
            }
        }

        RateLimiter::hit($key);

        if (count($errors) > 0) {
            return back()->withErrors(['invitations' => $errors]);
        }

        return back()->with('success', "{$successCount} invitation(s) sent successfully.");
    }

    public function accept(Request $request, string $token)
    {
        try {
            $invitation = TeamInvitation::where('token', $token)
                ->where('status', 'pending')
                ->firstOrFail();

            if ($invitation->email !== $request->user()->email) {
                return back()->with('error', 'This invitation was not meant for you.');
            }

            if ($invitation->expires_at->isPast()) {
                $invitation->update(['status' => 'expired']);
                return back()->with('error', 'This invitation has expired.');
            }

            // Add user to team
            $team = $invitation->team;
            $team->members()->create([
                'user_id' => $request->user()->id,
                'role' => $invitation->role
            ]);

            // Mark invitation as accepted
            $invitation->update(['status' => 'accepted']);

            // Delete the notification
            $request->user()->notifications()
                ->where('type', TeamInvitationNotification::class)
                ->where('data->invitation_token', $token)
                ->delete();

            // Notify team owner and admins
            $teamAdmins = $team->members()
                ->whereIn('role', ['owner', 'admin'])
                ->with('user')
                ->get()
                ->pluck('user');

            foreach ($teamAdmins as $admin) {
                $admin->notify(new \App\Notifications\TeamMemberAdded(
                    $team,
                    $request->user(),
                    $invitation->role
                ));
            }

            return redirect()->route('dashboard')
                ->with('success', "You have successfully joined {$team->name}!");

        } catch (\Exception $e) {
            return back()->with('error', 'Something went wrong while accepting the invitation.');
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
                ->where('type', TeamInvitationNotification::class)
                ->where('data->invitation_token', $token)
                ->delete();

            // Update invitation status to declined
            $invitation->update(['status' => 'declined']);

            return redirect()->back()->with('success', 'Invitation declined.');
        } catch (\Exception $e) {
            return back()->with('error', 'Something went wrong while declining the invitation.');
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
        $invitee = User::where('email', $invitation->email)->first();
        if ($invitee) {
            $invitee->notify(new TeamInvitationCancelled($team));
        }

        $invitation->delete();

        return back()->with('success', 'Invitation cancelled successfully.');
    }

    /**
     * Send a reminder for a pending invitation
     */
    public function remind(Request $request, Team $team, TeamInvitation $invitation)
    {
        Gate::authorize('manage-team', $team);

        if ($invitation->team_id !== $team->id) {
            abort(404);
        }

        if ($invitation->status !== 'pending') {
            return back()->withErrors(['status' => 'This invitation is no longer pending.']);
        }

        if (!$invitation->canSendReminder()) {
            return back()->withErrors(['limit' => 'Cannot send reminder at this time. Please wait 24 hours between reminders.']);
        }

        // Update reminder count and timestamp
        $invitation->update([
            'reminder_count' => $invitation->reminder_count + 1,
            'reminder_sent_at' => now()
        ]);

        // Send reminder email
        Mail::to($invitation->email)->send(new TeamInvitationMail($invitation, true));

        return back()->with('success', 'Reminder sent successfully.');
    }
}
