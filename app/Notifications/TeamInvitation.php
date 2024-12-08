<?php

namespace App\Notifications;

use App\Models\Team;
use App\Models\TeamInvitation as TeamInvitationModel;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TeamInvitation extends Notification
{
    use Queueable;

    public function __construct(
        protected Team $team,
        protected TeamInvitationModel $invitation
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Invitation to join {$this->team->name}")
            ->line("You have been invited to join {$this->team->name} as a {$this->invitation->role}.")
            ->action('Accept Invitation', route('team-invitations.accept', $this->invitation->token))
            ->line('This invitation will expire in 7 days.');
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'message' => "You have been invited to join {$this->team->name} as a {$this->invitation->role}.",
            'team_name' => $this->team->name,
            'invitation_token' => $this->invitation->token,
            'accept_url' => route('team-invitations.accept', $this->invitation->token),
            'decline_url' => route('team-invitations.decline', $this->invitation->token),
        ];
    }
}
