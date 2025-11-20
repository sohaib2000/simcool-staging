<?php

namespace App\Services;

use Stripe\Stripe;
use Stripe\PaymentIntent;
use App\Models\Payment;
use Exception;

class StripeService
{
    protected $secret;
    protected $key;

    public function __construct()
    {
        $this->secret = systemflag('paymentModeEnvRazorpay') ? systemflag('stripeLiveSecretkey') : systemflag('stripeTestingSecretkey');
        $this->key    = systemflag('paymentModeEnvRazorpay') ? systemflag('stripeLivePublishkey') : systemflag('stripeTestingPublishkey');
        Stripe::setApiKey($this->secret);
    }

    /**
     * Create Stripe Payment Intent and save in payments table
     */
    public function createIntent($order, $user)
    {
        try {
            $intent = PaymentIntent::create([
                'amount' => $order->total_amount * 100, // cents
                'currency' => $user->currency->name ?? 'usd',
                'description' => 'Payment for package',
                'metadata' => [
                    'order_id' => $order->id,
                    'user_id'  => $user->id,
                ],
            ]);

            // Save in payments table
            Payment::create([
                'user_id'          => $user->id,
                'order_id'         => $order->id,
                'currency_id'      => $order->currency_id,
                'gateway_order_id' => $intent->id, // Stripe payment_intent id
                'amount'           => $order->total_amount,
                'gateway'          => 'Stripe',
                'payment_for'      => 'Payment for '.$order->package->type,
                'currency'         => $user->currency->name ?? 'usd',
                'payment_status'   => 'created',
            ]);

            return [
                'status'  => true,
                'data'    => [
                    'esim_order_id'   => $order->id,
                    'gateway_order_id' => $intent->id,
                    'client_secret'   => $intent->client_secret,
                    'amount'          => $intent->amount,
                    'currency'        => $intent->currency,
                    'gateway_key'      => $this->key,
                    'name'            => systemflag('appName'),
                    'description'     => 'Payment for '.$order->package->type,
                    'phone'           => $user->phone ?? '9999999999',
                    'email'           => $user->email ?? 'customer@example.com',
                    'iccid'             => $user->iccid ?? null
                ]
            ];
        } catch (Exception $e) {
            return [
                'status'  => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Verify payment intent and update records
     */
    public function verifyPayment($data)
    {
        $paymentRecord = Payment::where('gateway_order_id', $data['gateway_order_id'])->first();
        try {
            $intent = PaymentIntent::retrieve($data['gateway_order_id']);

            if ($intent->status === 'succeeded') {

                if ($paymentRecord) {
                    $paymentRecord->payment_status = 'paid';
                    $paymentRecord->payment_id     = $intent->id ?? null;
                    $paymentRecord->payment_mode   = $intent->payment_method ?? null;
                    $paymentRecord->payment_ref   = $intent;
                    $paymentRecord->save();
                }

                return [
                    'status'   => true,
                    'payment'  => $intent,
                    'order_id' => $paymentRecord?->order_id,
                ];
            }
            if ($paymentRecord) {
                $paymentRecord->payment_status = 'failed';
                $paymentRecord->payment_id     = $intent->id ?? null;
                $paymentRecord->payment_mode   = $intent->payment_method ?? null;
                $paymentRecord->payment_ref   = $intent;
                $paymentRecord->save();
            }
            return [
                'status'  => false,
                'message' => 'Payment not successful yet. Status: ' . $intent->status,
            ];
        } catch (Exception $e) {
            return [
                'status'  => false,
                'message' => $e->getMessage(),
            ];
        }
    }
}
