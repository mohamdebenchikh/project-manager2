<?php

namespace App\Mail;

use App\Models\TeamInvitation;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TeamInvitationMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        protected TeamInvitation $invitation,
        protected bool $isReminder = false
    ) {}

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subject = $this->isReminder 
            ? "Reminder: You have a pending team invitation" 
            : "You've been invited to join a team";

        return new Envelope(
            subject: $subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        $team = $this->invitation->team;
        $inviter = $this->invitation->invitedBy;
        $expiresIn = now()->diffInDays($this->invitation->expires_at);

        return new Content(
            markdown: 'emails.team.invitation',
            with: [
                'team' => $team,
                'inviter' => $inviter,
                'invitation' => $this->invitation,
                'acceptUrl' => route('team-invitations.accept', ['token' => $this->invitation->token]),
                'declineUrl' => route('team-invitations.decline', ['token' => $this->invitation->token]),
                'expiresIn' => $expiresIn,
                'isReminder' => $this->isReminder,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
