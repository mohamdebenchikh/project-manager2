<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $currentTeam = $user ? $user->currentTeam : null;
        $currentTeamRole = null;

        if ($user) {
            $currentTeamRole = $user->getCurrentTeamRole();
        }

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user,
                'teams' => $user ? $user->allTeams() : [],
                'current_team' => $currentTeam,
                'current_team_role' => $currentTeamRole,
            ],
            'notifications' => $user ? [
                'items' => $user->unreadNotifications()
                    ->latest()
                    ->take(5)
                    ->get()
                    ->map(function ($notification) {
                        return [
                            'id' => $notification->id,
                            'type' => class_basename($notification->type),
                            'data' => $notification->data,
                            'read_at' => $notification->read_at,
                            'created_at' => $notification->created_at->diffForHumans(),
                        ];
                    }),
                'unread_count' => $user->unreadNotifications()->count(),
            ] : null,
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'message' => fn () => $request->session()->get('message')
            ],
        ]);
    }
}
