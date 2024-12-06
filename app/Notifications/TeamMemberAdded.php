<?php

namespace App\Notifications;

use App\Models\Team;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TeamMemberAdded extends Notification
{
    use Queueable;

    public function __construct(
        protected Team $team,
        protected User $newMember,
        protected string $role
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'message' => "{$this->newMember->name} has joined {$this->team->name} as a {$this->role}",
            'team_id' => $this->team->id,
            'team_name' => $this->team->name,
            'member_id' => $this->newMember->id,
            'member_name' => $this->newMember->name,
            'role' => $this->role,
        ];
    }
}
