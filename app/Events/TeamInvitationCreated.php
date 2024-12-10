<?php

namespace App\Events;

use App\Models\Team;
use App\Models\User;
use App\Models\TeamInvitation;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TeamInvitationCreated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public Team $team,
        public User $inviter,
        public string $inviteeEmail,
        public TeamInvitation $invitation,
        public string $role
    ) {}
}
