<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use NotificationChannels\Fcm\FcmMessage;
use NotificationChannels\Fcm\FcmChannel;
use NotificationChannels\Fcm\Resources\Notification as FcmNotification;

class AdminSendNoti extends Notification implements ShouldQueue
{
    use Queueable;

    protected $title;
    protected $description;
    protected $image;

    public function __construct($title, $description, $image)
    {
        $this->title = $title;
        $this->description = $description;
        $this->image = $image;
    }

    public function via($notifiable): array
    {
        return [FcmChannel::class];
    }

    public function toFcm($notifiable): FcmMessage
    {
        $imageUrl = $this->image ? asset($this->image) : null;

        return (new FcmMessage(
            notification: new FcmNotification(
                title: (string) $this->title,
                body: (string) $this->description ?? '',
                image: $imageUrl
            )
        ))
            ->data([
                'type' => '8',
                'image' => $imageUrl,
            ])
            ->custom([
                // iOS-specific
                'apns' => [
                    'headers' => [
                        'apns-priority' => '10',
                    ],
                    'payload' => [
                        'aps' => [
                            'alert' => [
                                'title' => (string) $this->title,
                                'body'  => (string) $this->description ?? '',
                            ],
                            'sound' => 'default',
                            'badge' => 1,
                            'mutable-content' => 1,
                        ],
                    ],
                    'fcm_options' => [
                        'image' => $imageUrl,
                    ],
                ],
                // Android-specific
                'android' => [
                    'priority' => 'high',
                    'notification' => [
                        'image' => $imageUrl,
                    ],
                ],
            ]);
    }
}
