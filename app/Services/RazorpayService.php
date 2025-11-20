<?php

namespace App\Services;

use Razorpay\Api\Api;
use Razorpay\Api\Errors\SignatureVerificationError;
use App\Models\Payment;
use Exception;

class RazorpayService
{
    protected $keyId;
    protected $secret;
    protected $api;

    public function __construct()
    {
        $this->keyId  = systemflag('paymentModeEnvRazorpay') ? systemflag('razorpayLivekeyId') : systemflag('razorpayTestingkeyId');
        $this->secret = systemflag('paymentModeEnvRazorpay') ? systemflag('razorpayLiveSecretkey') : systemflag('razorpayTestingSecretkey');
        $this->api    = new Api($this->keyId, $this->secret);
    }

    /**
     * Create Razorpay order and save in payments table
     */
    public function createOrder($order, $user)
    {
        try {
            $razorpayOrder = $this->api->order->create([
                'receipt'         => $order->order_ref,
                'amount'          => (int)$order->total_amount * 100,
                'currency'        => $user->currency->name ?? 'INR',
                'payment_capture' => 1
            ]);

            // Save in payments table
            Payment::create([
                'user_id'          => $user->id,
                'order_id'         => $order->id,
                'currency_id'         => $order->currency_id,
                'gateway_order_id' => $razorpayOrder['id'],
                'amount'           => $order->total_amount,
                'gateway'           => 'Razorpay',
                'payment_for'           => 'Payment for '.$order->package->type,
                'currency'         => $user->currency->name ?? 'INR',
                'payment_status'           => 'created'
            ]);

            return [
                'status'  => true,
                'data'    => [
                    'esim_order_id'     => $order->id,
                    'gateway_order_id'  => $razorpayOrder['id'],
                    'amount'            => $razorpayOrder['amount'],
                    'currency'          => $razorpayOrder['currency'],
                    'gateway_key'       => $this->keyId,
                    'name'              => systemflag('appName'),
                    'description'       => 'Payment for '.$order->package->type,
                    'phone'             => $user->phone ?? '9999999999',
                    'email'             => $user->email ?? 'customer@example.com',
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
     * Verify payment and update records
     */
    public function verifyPayment($data)
    {
        $attributes = [
            'razorpay_order_id'   => $data['gateway_order_id'],
            'razorpay_payment_id' => $data['razorpay_payment_id'],
            'razorpay_signature'  => $data['razorpay_signature']
        ];

        $paymentRecord = Payment::where('gateway_order_id', $data['gateway_order_id'])->first();

        try {
            // Verify Razorpay signature
            $this->api->utility->verifyPaymentSignature($attributes);

            // Fetch payment details from Razorpay
            $payment = $this->api->payment->fetch($data['razorpay_payment_id']);

            if ($paymentRecord) {
                $paymentRecord->payment_status = 'paid';
                $paymentRecord->payment_id     = $payment->id;
                $paymentRecord->payment_mode   = $payment->method ?? null;
                $paymentRecord->payment_ref    = json_encode($payment->toArray());
                $paymentRecord->save();
            }

            return [
                'status'   => true,
                'payment'  => $payment->toArray(),
                'order_id' => $paymentRecord?->order_id
            ];
        } catch (SignatureVerificationError $e) {
            if ($paymentRecord) {
                $paymentRecord->payment_status = 'failed';
                $paymentRecord->payment_ref    = json_encode(['error' => 'SignatureVerificationError', 'message' => $e->getMessage()]);
                $paymentRecord->save();
            }

            return [
                'status'   => false,
                'message'  => 'Payment verification failed: ' . $e->getMessage(),
                'order_id' => $paymentRecord?->order_id
            ];
        } catch (Exception $e) {
            if ($paymentRecord) {
                $paymentRecord->payment_status = 'failed';
                $paymentRecord->payment_ref    = json_encode(['error' => 'Exception', 'message' => $e->getMessage()]);
                $paymentRecord->save();
            }

            return [
                'status'   => false,
                'message'  => $e->getMessage(),
                'order_id' => $paymentRecord?->order_id
            ];
        }
    }
}
