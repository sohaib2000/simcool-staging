<?php

namespace App\Http\Controllers;

use App\Jobs\OrderStoreJob;
use App\Models\EsimOrder;
use App\Models\EsimPackage;
use App\Models\InAppProduct;
use App\Models\Payment;
use App\Models\UserEsim;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use App\Services\AiraloService;
use App\Services\CashfreeService;
use App\Services\RazorpayService;
use App\Services\StripeService;
use Illuminate\Validation\ValidationException;

class EsimOrderController extends BaseController
{
    // List all orders for authenticated user
    public function index()
    {
        $orders = Auth::user()->esimOrders()->latest()->paginate(15);
        return $this->sendResponse($orders, 'Orders retrieved successfully.');
    }
    // Create (purchase) a new eSIM order with auto-activation
    public function asyncOrder(Request $request, AiraloService $airalo)
    {
        try {
            $validated = $request->validate([
                'esim_package_id' => 'required|exists:esim_packages,id',
            ]);
        } catch (ValidationException $e) {
            return $this->sendValidationError($e->validator);
        }
        $user = Auth::guard('api')->user();

        $package = EsimPackage::findOrFail($validated['esim_package_id']);
        $getPrice = packagePrice($package->id,$user->currency->name);
        if ($getPrice['totalAmount'] <= 0) {
            return $this->sendError('Order amount invalid', 400, [
                'amount'   => $getPrice['totalAmount'],
            ]);
        }

        $order = EsimOrder::create([
            'user_id'        => $user->id,
            'esim_package_id' => $package->id,
            'currency_id' => $user->currencyId,
            'airalo_price' => $getPrice['airaloPrice'],
            'order_ref'      => 'ORD-' . Str::upper(Str::random(10)),
            'status'         => 'pending',
            'total_amount'         => $getPrice['totalAmount'],
            'activation_details' => null,
            'user_note'      => $validated['user_note'] ?? null,
        ]);
        try {
            $response = $airalo->placeAsyncOrder(
                $package->airalo_package_id
            );
            $updateOrder = EsimOrder::find($order->id);
            $updateOrder->webhook_request_id = $response['data']['request_id'];
            $updateOrder->save();
            return $this->sendResponse($order, 'Order created!', 201);
        } catch (\Exception $e) {
            $order->status = 'failed';
            $order->activation_details = ['error' => $e->getMessage()];
            $order->save();

            return $this->sendError('Order created but activation failed', 500, [
                'order'   => $order->load('package'),
                'details' => $e->getMessage()
            ]);
        }
    }

    public function store(Request $request, RazorpayService $razorpayService, StripeService $stripeService, CashfreeService $cashfreeService)
    {
        try {
            $validated = $request->validate([
                'esim_package_id' => 'required|exists:esim_packages,id',
                'user_note'       => 'nullable|string|max:500',
            ]);
            $paymentGateway = $request->payment_gateway ?? 'GpayInAppPurchase';
            $isPaymentGateway = false;
            if ($paymentGateway == 'Razorpay') {
                if (!systemflag('isActiveRazorpay')) {
                    $isPaymentGateway = true;
                }
            } elseif ($paymentGateway == 'Stripe') {
                if (!systemflag('isActiveStripe')) {
                    $isPaymentGateway = true;
                }
            } elseif ($paymentGateway == 'Cashfree') {
                if (!systemflag('isActiveCashfree')) {
                    $isPaymentGateway = true;
                }
            } elseif ($paymentGateway == 'GpayInAppPurchase') {
                $isPaymentGateway = false;
            }
            if ($isPaymentGateway) {
                return $this->sendError('Please select valid payment gateway');
            }
            $user = Auth::guard('api')->user();
            $package = EsimPackage::find($validated['esim_package_id']);
            $getPrice = packagePrice($package->id,$user->currency->name);
            $netPrice = $getPrice['totalAmount'];
            $totalAmount = $netPrice;
            if(isset($request->total_amount)){
                $totalAmount = $request->total_amount;
            }
            if ($totalAmount <= 0) {
                return $this->sendError('Order amount invalid', 400);
            }

            $lastOrderId = EsimOrder::max('id') ?? 0;
            $orderRef = 'OD' . date('Ym') . ($lastOrderId + 1);
            $order = EsimOrder::create([
                'user_id'           => $user->id,
                'esim_package_id'   => $package->id,
                'currency_id'       => $user->currencyId,
                'provider_price'      => $getPrice['providerPrice'],
                'order_ref'         => $orderRef,
                'status'            => 'pending',
                'total_amount'      => $totalAmount,
                'activation_details' => null,
                'user_note'         => $validated['user_note'] ?? null,
            ]);
            $user->iccid = $request->iccid ?? null;
            if ($paymentGateway == 'Stripe') {
                $paymentData = $stripeService->createIntent($order, $user);
            } elseif ($paymentGateway == 'Cashfree') {
                $paymentData = $cashfreeService->createOrder($order, $user);
            } elseif ($paymentGateway == 'Razorpay') {
                $paymentData = $razorpayService->createOrder($order, $user);
            } elseif($paymentGateway == 'GpayInAppPurchase') {
                $iapPrice = packagePrice($package->id, systemflag('iapDefaultCurrency'));
                $inAppProductSku = InAppProduct::where('min_price', '<=', $iapPrice['totalAmount'])
                    ->where('max_price', '>=', $iapPrice['totalAmount'])->pluck('sku')
                    ->first();
                Payment::create([
                    'user_id'          => $user->id,
                    'order_id'         => $order->id,
                    'currency_id'         => $order->currency_id,
                    'gateway_order_id' => '',
                    'amount'           => $order->total_amount,
                    'gateway'           => 'Google Play InAppPurchase',
                    'payment_for'           => 'Payment for ' . $order->package->type,
                    'currency'         => $user->currency->name ?? 'INR',
                    'payment_status'           => 'created'
                ]);
                $paymentData = [
                    'status'  => true,
                    'data'    => [
                        'esim_order_id'     => $order->id,
                        'gateway_order_id'  => $inAppProductSku,
                        'package_name'      => $order->package->name,
                        'amount'            => $getPrice['totalAmount'],
                        'currency'          => $user->currency->name ?? 'USD',
                        'gateway_key'       => '',
                        'name'              => systemflag('appName'),
                        'description'       => 'Payment for ' . $order->package->type,
                        'phone'             => $user->phone ?? '9999999999',
                        'email'             => $user->email ?? 'customer@example.com',
                        'iccid'             => $user->iccid ?? null
                    ]
                ];
            }else{
                 return $this->sendError('Please select valid payment gateway');
            }

            if (!$paymentData['status']) {
                return $this->sendError($paymentData['message'], 500);
            }
            return $this->sendResponse($paymentData['data'], 'Order created. Proceed with payment.', 201);
        } catch (\Exception $th) {
            return $this->sendError($th->getMessage(), 500);
        }
    }


    // Show a single order for user
    public function show($id)
    {
        $order = Auth::guard('api')->user()->esimOrders()->with('package')->findOrFail($id);
        return $this->sendResponse($order, 'Order retrieved.');
    }

    // Update order note or cancel (user-side)
    public function update(Request $request, $id)
    {
        $order = Auth::guard('api')->user()->esimOrders()->findOrFail($id);

        try {
            $validated = $request->validate([
                'user_note' => 'nullable|string|max:500',
                'cancel'    => 'sometimes|boolean'
            ]);
        } catch (ValidationException $e) {
            return $this->sendValidationError($e->validator);
        }

        if (!empty($validated['cancel'])) {
            $order->status = 'cancelled';
        }
        if (!empty($validated['user_note'])) {
            $order->user_note = $validated['user_note'];
        }
        $order->save();
        return $this->sendResponse($order->load('package'), 'Order updated');
    }

    // Status endpoint for user's order
    public function status($id)
    {
        $order = Auth::guard('api')->user()->esimOrders()->findOrFail($id);
        return $this->sendResponse([
            'status' => $order->status,
            'activation_details' => $order->activation_details,
        ], 'Order status retrieved.');
    }

    public function myEsims(Request $request)
    {
        try {
            $userid = Auth::guard('api')->user()->id;
             $esims = UserEsim::with(['order:id,order_ref,activation_details,total_amount','package:id,esim_provider'])->where('user_id', $userid)->orderBy('id', 'desc')->get();
            return $this->sendResponse($esims, 'Esims data retrived');
        } catch (\Exception $th) {
            return $this->sendError($th->getMessage());
        }
    }
}
