<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\Fcm\FcmMessage;
use NotificationChannels\Fcm\FcmChannel;
use NotificationChannels\Fcm\Resources\Notification as FcmNotification;

class EsimReadyToUseNoti extends Notification implements ShouldQueue
{
    use Queueable;

    protected $iccid;

    public function __construct($iccid)
    {
        $this->iccid = $iccid;
    }

    public function via($notifiable): array
    {
        return [FcmChannel::class];
    }

    public function toFcm($notifiable): FcmMessage
    {
        return (new FcmMessage(
            notification: new FcmNotification(
                title: 'Your Esim Ready to use',
                body: 'Your ICCID ' . $this->iccid . '!'
            )
        ))
            ->data([
                'type'     => '3',
                'iccid' => $this->iccid,
            ]);
    }
}
