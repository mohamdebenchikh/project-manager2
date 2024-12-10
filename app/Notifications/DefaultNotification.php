<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DefaultNotification extends Notification
{
    use Queueable;

    protected string $contentType;
    protected string $message;
    protected string $actionUrl;

    /**
     * Create a new notification instance.
     *
     * @param string $contentType
     * @param string $message
     * @param string $actionUrl
     */
    public function __construct(string $contentType, string $message, string $actionUrl)
    {
        $this->contentType = $contentType;
        $this->message = $message;
        $this->actionUrl = $actionUrl;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->line($this->contentType) // Add the content type
                    ->line($this->message) // Add the message
                    ->action('View Action', $this->actionUrl) // Add the action URL
                    ->line('Thank you for using our application!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'contentType' => $this->contentType,
            'message' => $this->message,
            'actionUrl' => $this->actionUrl,
        ];
    }
}
