<?php

namespace App\Listeners;

use App\Events\TeamInvitationCreated;
use App\Models\User;
use App\Notifications\TeamInvitation;

class SendTeamInvitationNotification
{
    /**
     * Handle the event.
     */
    public function handle(TeamInvitationCreated $event): void
    {
        // Find the invitee user
        $invitee = User::where('email', $event->inviteeEmail)->first();
        
        if ($invitee) {
            // Send in-app notification to the invitee
            $invitee->notify(new TeamInvitation(
                $event->team,
                $event->invitation
            ));
        }
    }
}
