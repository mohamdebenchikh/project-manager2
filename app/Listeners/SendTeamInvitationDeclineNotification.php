<?php

namespace App\Listeners;

use App\Notifications\TeamInvitationDeclineNotification;

class SendTeamInvitationDeclineNotification
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(TeamInvitationDeclineEvent $event): void
    {
        $event->inviter->notify(new TeamInvitationDeclineNotification($event->team));
    }
}
