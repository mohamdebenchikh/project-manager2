<?php

namespace App\Http\Controllers;

use App\Http\Requests\InviteTeamMemberRequest;
use App\Models\Team;
use App\Models\User;
use App\Models\TeamInvitation;
use App\Notifications\DefaultNotification;
use Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Inertia\Inertia;

class TeamInvitationController extends Controller
{
    /**
     * Maximum number of invitations a user can send per hour.
     */
    const HOURLY_INVITATION_LIMIT = 20;

    public function search(Request $request, Team $team)
    {
        $query = $request->input('query');

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


    public function index()
    {
        $userEmail = Auth::user()->email;
        $invitations = TeamInvitation::where('status', 'pending')->where('email', $userEmail)->get();

        return Inertia::render('invitations/index', [
            'invitations' => $invitations,
        ]);
    }

    public function show(string $token)
    {   
        $invitation = TeamInvitation::where('token', $token)->firstOrFail();

        return Inertia::render('invitations/show', [
            'invitation' => $invitation
        ]);
    }

    /**
     * Invite a new team member to the given team.
     */
    public function invite(InviteTeamMemberRequest $request, Team $team)
    {
        try {
            Gate::authorize('manage-team', $team);

            $existingInvitation = TeamInvitation::where('team_id', $team->id)
                ->where('email', $request->email)
                ->where('status', 'pending')
                ->first();

            if ($existingInvitation) {
                return redirect()->back()
                    ->withErrors(['error' => 'An invitation has already been sent to this email.']);
            }

            $key = 'team_invitations.' . $request->user()->id;
            if (RateLimiter::tooManyAttempts($key, self::HOURLY_INVITATION_LIMIT)) {
                $seconds = RateLimiter::availableIn($key);
                return redirect()->to(route('teams.invitations.index', $team))
                    ->withErrors(['email' => "Too many invitations. Please try again in {$seconds} seconds."]);
            }

            if ($team->members()
                ->whereIn('user_id', User::where('email', $request->email)->pluck('id'))
                ->exists()
            ) {
                return redirect()->back()
                    ->withErrors(['email' => 'This user is already a member of the team.']);
            }

            if (!$team->personal_team) {
                $currentMemberCount = $team->members()->count();
                $pendingInvitesCount = $team->invitations()->where('status', 'pending')->count();
                $maxMembers = config('teams.max_members', 10);

                if (($currentMemberCount + $pendingInvitesCount + 1) > $maxMembers) {
                    return redirect()->back()
                        ->withErrors(['email' => 'Team has reached maximum member capacity.']);
                }
            }

            $invitation = TeamInvitation::create([
                'team_id' => $team->id,
                'email' => $request->email,
                'role' => $request->role ?? 'member',
                'invited_by' => Auth::id(),
                'status' => 'pending',
                'token' => Str::random(64),
                'expires_at' => now()->addDays(7),
            ]);

            $invitation->invitee()?->notify(new DefaultNotification(
                'Team Invitation',
                "You have been invited to join the team '{$team->name}'.",
                route('teams.accept-invitation', ['token' => $invitation->token])
            ));

            RateLimiter::hit($key);

            return redirect()->back()
                ->with('success', 'Invitation sent successfully.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function accept(Request $request, string $token)
    {
        try {
            $invitation = TeamInvitation::where('token', $token)
                ->where('status', 'pending')
                ->firstOrFail();

            if ($invitation->email !== $request->user()->email) {
                return redirect()->back()
                    ->withErrors(['error' => 'This invitation was not meant for you.']);
            }

            if ($invitation->expires_at->isPast()) {
                $invitation->update(['status' => 'expired']);
                return redirect()->back()
                    ->withErrors(['error' => 'This invitation has expired.']);
            }

            $team = $invitation->team;

            if (!$team) {
                return redirect()->back()
                    ->withErrors(['error' => 'Team not found']);
            }

            $team->addMember($request->user(), $invitation->role);

            $invitation->update(['status' => 'accepted']);

            $invitation->inviter->notify(new DefaultNotification(
                'Team Member Added',
                "{$request->user()->name} has joined your team '{$team->name}'.",
                route('teams.show', $team)
            ));

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

            $invitation->update(['status' => 'declined']);

            $invitation->inviter->notify(new DefaultNotification(
                'Team Invitation Declined',
                "Your invitation to {$invitation->email} to join '{$invitation->team->name}' was declined.",
                ''
            ));

            return redirect()->back()
                ->with('success', 'Invitation declined successfully.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function destroy(Request $request, Team $team, TeamInvitation $invitation)
    {
        Gate::authorize('manage-team', $team);

        if ($invitation->team_id !== $team->id) {
            abort(404);
        }

        $invitation->invitee()?->notify(new DefaultNotification(
            'Team Invitation Cancelled',
            "Your invitation to join '{$team->name}' has been cancelled.",
            ''
        ));

        $invitation->delete();

        return redirect()->back()
            ->with('success', 'Invitation cancelled successfully.');
    }
}
