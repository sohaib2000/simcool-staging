<?php

namespace App\Jobs;

use App\Mail\AllMail;
use App\Models\EsimOrder;
use App\Services\AiraloService;
use Illuminate\Bus\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class UpdateOrderStatus implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $orderId;

    /**
     * Create a new job instance.
     */
    public function __construct($orderId)
    {
        $this->orderId = $orderId;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $order = EsimOrder::find($this->orderId);
            $order->status = 'cancelled';
            $order->save();
        } catch (\Exception $e) {
            Log::error('UpdateOrderStatus failed', [
                'error' => $e->getMessage(),
                'order_id' => $this->order->id,
            ]);
        }
    }
}
