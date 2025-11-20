<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\Fcm\FcmMessage;
use NotificationChannels\Fcm\FcmChannel;
use NotificationChannels\Fcm\Resources\Notification as FcmNotification;


class LowDataNoti extends Notification implements ShouldQueue
{
    use Queueable;

    protected $packageName;
    protected $expiredAt;

    public function __construct($packageName,$expiredAt)
    {
        $this->packageName = $packageName;
        $this->expiredAt = $expiredAt;
    }

    public function via($notifiable): array
    {
        return [FcmChannel::class];
    }

    public function toFcm($notifiable): FcmMessage
    {
        return (new FcmMessage(
            notification: new FcmNotification(
                title: 'Your data is low',
                body: 'Please topup now!'
            )
        ))
            ->data([
                'type'     => '4',
                'package'  =>  $this->packageName,
                'expired_at' => $this->expiredAt
            ]);
    }
}
