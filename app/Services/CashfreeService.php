<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use App\Models\Payment;

class CashfreeService
{
    protected $appId;
    protected $secret;
    protected $baseUrl;

    public function __construct()
    {
        $this->appId   = systemflag('cashfreeAppId');
        $this->secret  = systemflag('cashfreeSecretKey');
        $mode          = systemflag('paymentModeEnvCashfree') ? 'PROD' : 'TEST';

        $this->baseUrl = $mode === 'PROD'
            ? 'https://api.cashfree.com/pg/orders'
            : 'https://sandbox.cashfree.com/pg/orders';
    }

    /**
     * Create Cashfree order
     */
    public function createOrder($order, $user)
    {
        $orderId = $order->order_ref;

        $payload = [
            'order_id'       => $orderId,
            'order_amount' => (float) number_format($order->total_amount, 2, '.', ''),
            'order_currency' => $order->currency->name ?? 'INR',
            'customer_details' => [
                'customer_id'    => (string)$user->id,
                'customer_email' => $user->email,
                'customer_phone' => $user->phone ?? '9999999999',
            ],
            'order_note'     => $order->package->package_id ?? '',
            'return_url'     => route('cashfree.callback'),
            'notify_url'     => route('cashfree.webhook'),
        ];

        $response = Http::withHeaders([
            'x-client-id'     => $this->appId,
            'x-client-secret' => $this->secret,
            'x-api-version'   => '2025-01-01',
            'Content-Type'    => 'application/json',
        ])->post($this->baseUrl, $payload);

        $data = $response->json();

        // Save Payment Record
        Payment::create([
            'user_id'          => $user->id,
            'order_id'         => $order->id,
            'currency_id'         => $order->currency_id,
            'gateway_order_id' => $orderId,
            'amount'           => (float) number_format($order->total_amount, 2, '.', ''),
            'gateway'           => 'Cashfree',
            'payment_for'           => 'Payment for '.$order->package->type,
            'currency'         => $user->currency->name ?? 'INR',
            'payment_status'           => 'created',
            'payment_ref'           => json_encode($data, JSON_UNESCAPED_UNICODE),
        ]);

        return [
            'status'  => true,
            'data'    => [
                'esim_order_id'     => $order->id,
                'gateway_order_id'  => $orderId ,
                'amount'            => (float) number_format($order->total_amount, 2, '.', ''),
                'currency'          => $order->currency->name ?? 'INR',
                'gateway_key'       => $this->secret,
                'name'              => systemflag('appName'),
                'description'       => 'Payment for '.$order->package->type,
                'phone'             => $user->phone ?? '9999999999',
                'email'             => $user->email ?? 'customer@example.com',
                'iccid'             => $user->iccid ?? null,
                'payment_session_id'=> $data['payment_session_id'],
            ]
        ];
    }

    /**
     * Verify Cashfree order
     */
    public function verifyPayment($orderId)
    {
        $url = $this->baseUrl . '/' . $orderId;

        $response = Http::withHeaders([
            'x-client-id'     => $this->appId,
            'x-client-secret' => $this->secret,
            'x-api-version'   => '2025-01-01',
        ])->get($url);

        $data = $response->json();

        if (($data['order_status'] ?? '') === 'PAID') {
            $paymentRecord =  Payment::where('gateway_order_id', $orderId)->first();
            $paymentRecord->payment_status = 'paid';
            $paymentRecord->payment_id = $data['cf_order_id'] ?? null;
            $paymentRecord->payment_mode = $data['order_meta']['payment_methods'] ?? null;
            $paymentRecord->payment_ref = json_encode($data, JSON_UNESCAPED_UNICODE);
            $paymentRecord->save();
        }

        return [
            'status'   => true,
            'payment'  => $data,
            'order_id' => $paymentRecord?->order_id
        ];

        return $data;
    }

    /**
     * Handle Webhook
     */
    public function handleWebhook($payload)
    {
        $orderId = $payload['data']['order']['order_id'] ?? null;
        $status  = $payload['data']['order']['order_status'] ?? null;

        if ($orderId) {
            Payment::where('gateway_order_id', $orderId)->update([
                'payment_status' => strtolower($status),
                'payment_ref'    => json_encode($payload, JSON_UNESCAPED_UNICODE),
            ]);
        }
    }
}
