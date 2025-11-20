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

    protected $order;

    /**
     * Create a new job instance.
     */
    public function __construct(EsimOrder $order)
    {
        $this->order = $order;
    }

    /**
     * Execute the job.
     */
    public function handle(AiraloService $airaloService): void
    {
        try {
            $orderCode = $this->order->activation_details['id'];

            $data = $airaloService->getOrderStatus($orderCode);

            if (!empty($data['data'])) {
                $this->order->update([
                    'status' => $data['data']['status']['name'] ?? null,
                ]);
                // if ($data['data']['status']['name'] == 'Completed') {
                //     $orderTemp = emailTemplate('activation');
                //     $companyName = systemflag('appName');
                //     $template = $orderTemp->description;
                //     $tempSubject = $orderTemp->subject;
                //     $location = '';
                //     if ($this->order->package->operator->type == 'local') {
                //         $location = $this->order->package->operator->country->name ?? '';
                //     } else {
                //         $location = $this->order->package->operator->region->name ?? '';
                //     }
                //     $data = [
                //         'qrCode' =>  $this->order->order_ref,
                //         'packageName' =>  $this->order->package->name,
                //         'location' =>  $location,
                //         'iccid' =>  $this->order->esims->iccid ?? '',
                //         'activationUrl' =>  $this->order->esims->qrcode ?? '',
                //         'companyName' => $companyName,
                //         'date' => date('Y')
                //     ];

                //     Mail::to($this->order->user->email)->send(new AllMail($template, $data, $tempSubject));
                // }
            } else {
                Log::warning("Empty or invalid response for orders status: {$orderCode}", $data);
            }
        } catch (\Exception $e) {
            Log::error('UpdateOrderStatus failed', [
                'error' => $e->getMessage(),
                'order_id' => $this->order->id,
            ]);
        }
    }
}
