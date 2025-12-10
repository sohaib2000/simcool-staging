<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Razorpay\Api\Order;

class OrderPlaced
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $order;

    public function __construct(Order $order)
    {
        // Pass the order instance to the event
        $this->order = $order;
    }

    public function broadcastOn(): array
    {
        return [
            // User channel
            new PrivateChannel('user.' . $this->order->user_id),

            // Admin channel
            new PrivateChannel('admin')
        ];
    }

    public function broadcastAs(): string
    {
        return 'order.placed';
    }
}
