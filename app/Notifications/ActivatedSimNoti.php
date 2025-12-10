<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use NotificationChannels\Fcm\FcmMessage;
use NotificationChannels\Fcm\FcmChannel;
use NotificationChannels\Fcm\Resources\Notification as FcmNotification;
use Illuminate\Contracts\Queue\ShouldQueue;

class ActivatedSimNoti extends Notification implements ShouldQueue
{
    use Queueable;

    protected $esim;

    public function __construct($esim)
    {
        $this->esim = $esim;
    }

    public function via($notifiable): array
    {
        return [FcmChannel::class];
    }

    public function toFcm($notifiable): FcmMessage
    {
        return (new FcmMessage(
            notification: new FcmNotification(
                title: 'Your Esim Activated!',
                body: 'Your ICCID ' . $this->esim->iccid . '!'
            )
        ))
            ->data([
                'type'     => '2',
                'iccid' => $this->esim->iccid,
                'country_region' => $this->esim->package->operator->region->name ?? $this->esim->package->operator->country->name,
            ]);
    }
}
