<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\Fcm\FcmMessage;
use NotificationChannels\Fcm\FcmChannel;
use NotificationChannels\Fcm\Resources\Notification as FcmNotification;
use Illuminate\Contracts\Queue\ShouldQueue;

class SupportTicketNoti extends Notification implements ShouldQueue
{
    use Queueable;

    protected $ticketid;

    public function __construct($ticketid)
    {
        $this->ticketid = $ticketid;
    }

    public function via($notifiable): array
    {
        return [FcmChannel::class];
    }

    public function toFcm($notifiable): FcmMessage
    {
        return (new FcmMessage(
            notification: new FcmNotification(
                title: 'Ticket Message #' . $this->ticketid,
                body: 'New message from administrator!'
            )
        ))
            ->data([
                'type'     => '9',
                'ticket_id' => (string) $this->ticketid,
            ]);
    }
}
