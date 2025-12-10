<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use NotificationChannels\Fcm\FcmMessage;
use NotificationChannels\Fcm\FcmChannel;
use NotificationChannels\Fcm\Resources\Notification as FcmNotification;
use Illuminate\Contracts\Queue\ShouldQueue;

class OrderPlacedNoti extends Notification implements ShouldQueue
{
    use Queueable;

    protected $order;

    public function __construct($order)
    {
        $this->order = $order;
    }

    public function via($notifiable): array
    {
        return [FcmChannel::class];
    }

    public function toFcm($notifiable): FcmMessage
    {
        return (new FcmMessage(
            notification: new FcmNotification(
                title: 'Order Placed!',
                body: 'Your order #' . $this->order->order_ref . ' has been placed successfully!'
            )
        ))
        ->data([
            'type'     => '1',
            'order_id' => (string) $this->order->order_ref,
        ]);
    }
}
