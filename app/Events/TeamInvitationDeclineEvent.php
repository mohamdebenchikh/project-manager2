<?php

namespace App\Events;

use App\Models\Team;
use App\Models\TeamInvitation;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TeamInvitationDeclineEvent
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public Team $team,
        public User $inviter,
        public TeamInvitation $invitation
    ) {}
}
