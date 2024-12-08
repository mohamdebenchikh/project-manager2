<?php

namespace App\Http\Controllers;

use App\Models\Team;
use App\Models\User;
use App\Models\TeamMember;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use App\Notifications\TeamMemberRemoved;
use App\Notifications\TeamDeleted;
use Illuminate\Support\Facades\DB;


class TeamController extends Controller
{
    /**
     * Display a listing of the teams.
     */
    public function index()
    {
        $user = auth()->user();

        return Inertia::render('teams/index', [
            'teams' => $user->allTeams()->map(function ($team) {
                return array_merge($team->toArray(), [
                    'owner' => $team->owner,
                    'members' => $team->members()->get(),
                    'personal_team' => $team->personal_team,
                ]);
            }),
        ]);
    }

    /**
     * Show the form for creating a new team.
     *
     * @return \Inertia\Response
     */
    public function create()
    {
        return Inertia::render('teams/create');
    }

    /**
     * Create a new team instance after a valid request has been made.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'personal_team' => ['required', 'boolean'],
        ]);

        $team = $request->user()->ownedTeams()->create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'personal_team' => $validated['personal_team'],
            'active' => true,
            'owner_id' => $request->user()->id
        ]);

        $team->addMember($request->user(), 'admin');

        return redirect()->route('teams.settings', $team)->with('success', 'Team created successfully.');
    }

    /**
     * Switch the user's current team.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function switch(Request $request)
    {
        $request->validate([
            'team_id' => ['required', 'exists:teams,id'],
        ]);

        $team = $request->user()->allTeams()->findOrFail($request->team_id);
        $request->user()->switchTeam($team);

        return redirect()->route('dashboard')->with('success', 'Team switched successfully.');
    }

    /**
     * Show the current team settings.
     *
     * @return \Inertia\Response
     */
    public function currentTeamSettings()
    {
        $team = auth()->user()->currentTeam;
        return $this->settings($team);
    }

    /**
     * Show the team settings.
     *
     * @param  \App\Models\Team  $team
     * @return \Inertia\Response
     */
    public function settings(Team $team)
    {
        Gate::authorize('manage-team', $team);

        return Inertia::render('teams/settings', [
            'team' => $team,
            'members' => $team->allMembers()
                ->get()
                ->map(function ($member) {
                    return [
                        'id' => $member->id,
                        'name' => $member->name,
                        'email' => $member->email,
                        'role' => $member->pivot->role,
                        'avatar' => $member->avatar
                    ];
                }),
            'availableRoles' => ['admin', 'member'],
            'userRole' => $team->isOwnedBy(Auth::user()) ? 'owner' : $team->members()->where('user_id', Auth::id())->first()->role,
            'is_personal_team' => $team->personal_team,
            'invitations' => $team->invitations()
                ->whereIn('status', ['pending', 'accepted', 'declined'])
                ->orderBy('created_at', 'desc')
                ->get()
        ]);
    }

    /**
     * Display the specified team.
     *
     * @param  \App\Models\Team  $team
     * @return \Inertia\Response
     */
    public function show(Team $team)
    {
        $currentUserRole = $team->isOwnedBy(Auth::user()) ? 'owner' : $team->members()->where('user_id', Auth::id())->first()->role;
        return Inertia::render('teams/show', [
            'team' => array_merge($team->toArray(), [
                'owner' => $team->owner,
                'members' => $team->members()->get(),
                'currentUserRole' => $currentUserRole,
                'personal_team' => $team->personal_team,
            ]),
        ]);
    }

    /**
     * Update the team instance.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Team  $team
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, Team $team)
    {
        Gate::authorize('manage-team', $team);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'personal_team' => ['boolean'],
        ]);

        $team->update([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'personal_team' => $validated['personal_team'] ?? false,
        ]);

        return redirect()->back()->with('success', 'Team updated successfully.');
    }

    /**
     * Update the role for the given team member.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  Team  $team
     * @param  int  $memberId
     * @return \Illuminate\Http\RedirectResponse
     */
    public function updateMemberRole(Request $request, Team $team, $memberId)
    {
        // Find the member
        $member = $team->members()->findOrFail($memberId);

        // Check if user has permission to update roles
        if (!$team->isOwnedBy(auth()->user()) && !$team->members()->where('id', auth()->id())->where('role', 'admin')->exists()) {
            abort(403, 'You do not have permission to update member roles.');
        }

        // Cannot update team owner's role
        if ($member->id === $team->owner_id) {
            return back()->withErrors(['error' => 'Cannot modify the team owner\'s role.']);
        }

        // Validate the role
        $validated = $request->validate([
            'role' => ['required', 'string', 'in:admin,member'],
        ]);

        try {
            DB::table('team_members')
                ->where('team_id', $team->id)
                ->where('user_id', $member->id)
                ->update(['role' => $validated['role']]);

            return redirect()->back()->with('success', 'Team member role updated successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Remove the given member from the team.
     *
     * @param  Team  $team
     * @param  TeamMember  $member
     * @return \Illuminate\Http\RedirectResponse
     */
    public function removeMember(Team $team, TeamMember $member)
    {
        // Verify the member belongs to this team
        if ($member->team_id !== $team->id) {
            abort(404);
        }

        // Check if user has permission to remove members
        if (!$team->isOwnedBy(auth()->user()) && !$team->members()->where('user_id', auth()->id())->where('role', 'admin')->exists()) {
            abort(403, 'You do not have permission to remove team members.');
        }

        // Cannot remove team owner
        if ($member->user_id === $team->owner_id) {
            return back()->withErrors(['error' => 'Cannot remove the team owner.']);
        }

        // Cannot remove yourself if you're not the owner
        if ($member->user_id === auth()->id() && !$team->isOwnedBy(auth()->user())) {
            return back()->withErrors(['error' => 'You cannot remove yourself from the team.']);
        }

        try {
            DB::transaction(function () use ($team, $member) {
                // Get user before deleting the member
                $user = User::find($member->user_id);

                // Delete the team member
                $member->forceDelete();

                // If user was viewing this team, switch to their personal team
                if ($user && $user->current_team_id === $team->id) {
                    $personalTeam = $user->personalTeam();
                    if ($personalTeam) {
                        $user->switchTeam($personalTeam);
                    }
                }

                // Notify the removed user
                if ($user) {
                    $user->notify(new TeamMemberRemoved($team));
                }
            });

            return back()->with('success', 'Team member removed successfully.');
        } catch (\Exception $e) {
            report($e);
            return back()->withErrors(['error' => 'Failed to remove team member.']);
        }
    }

    /**
     * Update the team status.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Team  $team
     * @return \Illuminate\Http\RedirectResponse
     */
    public function updateStatus(Request $request, Team $team)
    {
        Gate::authorize('manage-team', $team);

        // Prevent deactivating personal teams
        if ($team->personal_team) {
            return back()->with('error', 'Personal teams cannot be deactivated.');
        }

        $validated = $request->validate([
            'active' => ['required', 'boolean'],
        ]);

        $team->update(['active' => $validated['active']]);

        return back()->with(
            'success',
            $validated['active']
                ? 'Team has been activated successfully.'
                : 'Team has been deactivated successfully.'
        );
    }

    /**
     * Delete the given team.
     *
     * @param  Team  $team
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Team $team)
    {
        // Only owner can delete team
        if (auth()->id() !== $team->owner_id) {
            abort(403, 'Only the team owner can delete the team.');
        }

        // Cannot delete personal team
        if ($team->personal_team) {
            return back()->withErrors(['error' => 'Cannot delete personal team.']);
        }

        try {
            DB::transaction(function () use ($team) {
                // Get all team members before deletion for notifications
                $members = $team->members()->with('user')->get();

                // Delete the team (this will trigger the deleting event in the Team model)
                $team->delete();

                // Notify all members about team deletion
                foreach ($members as $member) {
                    if ($member->user_id !== $team->owner_id) {
                        $member->user->notify(new TeamDeleted($team->name));
                    }
                }

                // Switch owner to their personal team
                $owner = auth()->user();
                $personalTeam = $owner->personalTeam();
                if ($personalTeam) {
                    $owner->switchTeam($personalTeam);
                }
            });

            return redirect()->route('teams.index')->with('success', 'Team deleted successfully.');
        } catch (\Exception $e) {
            report($e);
            return back()->withErrors(['error' => 'Failed to delete team. Please try again.']);
        }
    }
}
