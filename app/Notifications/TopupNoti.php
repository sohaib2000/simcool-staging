<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use NotificationChannels\Fcm\FcmMessage;
use NotificationChannels\Fcm\FcmChannel;
use Illuminate\Notifications\Notification;
use NotificationChannels\Fcm\Resources\Notification as FcmNotification;

class TopupNoti extends Notification implements ShouldQueue
{
    use Queueable;

    protected $package;

    public function __construct($package) {
        $this->package = $package;
    }

    public function via($notifiable): array
    {
        return [FcmChannel::class];
    }

    public function toFcm($notifiable): FcmMessage
    {
        return (new FcmMessage(
            notification: new FcmNotification(
                title: 'Topup successfull!',
                body: 'Topup plan:'.$this->package->name
            )
        ))
            ->data([
                'type'     => '7',
            ]);
    }
}
