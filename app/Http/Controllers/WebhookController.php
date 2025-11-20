<?php

namespace App\Http\Controllers;

use App\Models\EsimOrder;
use App\Models\UserEsim;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class WebhookController extends Controller
{
    public function orderDetails(Request $request)
    {
        // try {
            $data = $request->all();
            // Validate the incoming request
            // $validator = Validator::make($request->all(), [
            //     'request_id' => 'required|string|max:255',
            //     'data' => 'required|array',
            //     'data.sims' => 'required|array|min:1',
            //     'data.sims.*.iccid' => 'required|string|max:255',
            //     'data.sims.*.imsis' => 'nullable|array',
            //     'data.sims.*.matching_id' => 'nullable|string|max:255',
            //     'data.sims.*.qrcode' => 'nullable|string',
            //     'data.sims.*.qrcode_url' => 'nullable|string|url|max:500',
            //     'data.sims.*.airalo_code' => 'nullable|string|max:255',
            //     'data.sims.*.apn_type' => 'nullable|string|max:100',
            //     'data.sims.*.apn_value' => 'nullable|string|max:255',
            //     'data.sims.*.is_roaming' => 'nullable|boolean',
            //     'data.sims.*.confirmation_code' => 'nullable|string|max:255',
            //     'data.sims.*.apn' => 'nullable|string|max:255',
            //     'data.sims.*.direct_apple_installation_url' => 'nullable|string|url|max:500',
            // ]);

            // if ($validator->fails()) {
            //     Log::error('Airalo webhook validation failed', [
            //         'errors' => $validator->errors(),
            //         'request_data' => $request->all()
            //     ]);

            //     return response()->json([
            //         'status' => 'validation_error',
            //         'errors' => $validator->errors()
            //     ], 400);
            // }

            // $data = $validator->validated();

            // Find the order
        //     $order = EsimOrder::where('webhook_request_id', $data['request_id'])->first();

        //     if (!$order) {
        //         Log::warning('Order not found for webhook', [
        //             'request_id' => $data['request_id']
        //         ]);
        //         return response()->json(['status' => 'Order not found but acknowledged'], 200);
        //     }

        //     // Validate that the order belongs to a valid user
        //     if (!$order->user_id) {
        //         Log::error('Order has no associated user', [
        //             'order_id' => $order->id,
        //             'request_id' => $data['request_id']
        //         ]);
        //         return response()->json(['status' => 'Invalid order - no user'], 400);
        //     }

        //     // Update order activation details
        //     $order->activation_details = $data['data'];

        //     // Process each SIM
        //     foreach ($data['data']['sims'] as $index => $esim) {
        //         try {
        //             // Additional validation for critical fields
        //             if (empty($esim['iccid'])) {
        //                 Log::error('Empty ICCID found in webhook data', [
        //                     'sim_index' => $index,
        //                     'request_id' => $data['request_id']
        //                 ]);
        //                 continue;
        //             }

        //             UserEsim::updateOrCreate(
        //                 [
        //                     'iccid' => $esim['iccid']
        //                 ],
        //                 [
        //                     'user_id' => $order->user_id,
        //                     'order_id' => $order->id,
        //                     'package_id' => $order->esim_package_id,
        //                     'iccid' => $esim['iccid'],
        //                     'imsis' => $esim['imsis'] ?? null,
        //                     'matching_id' => $esim['matching_id'] ?? null,
        //                     'qrcode' => $esim['qrcode'] ?? null,
        //                     'qrcode_url' => $esim['qrcode_url'] ?? null,
        //                     'airalo_code' => $esim['airalo_code'] ?? null,
        //                     'apn_type' => $esim['apn_type'] ?? null,
        //                     'apn_value' => $esim['apn_value'] ?? null,
        //                     'is_roaming' => isset($esim['is_roaming']) ? (bool)$esim['is_roaming'] : false,
        //                     'confirmation_code' => $esim['confirmation_code'] ?? null,
        //                     'apn' => $esim['apn'] ?? null,
        //                     'direct_apple_installation_url' => $esim['direct_apple_installation_url'] ?? null,
        //                 ]
        //             );
        //         } catch (\Exception $simException) {
        //             Log::error('Error processing individual SIM', [
        //                 'error' => $simException->getMessage(),
        //                 'request_id' => $data['request_id']
        //             ]);
        //             // Continue processing other SIMs even if one fails
        //             continue;
        //         }
        //     }

        //     $order->save();

        //     Log::info('Airalo webhook processed successfully', [
        //         'order_id' => $order->id,
        //         'request_id' => $data['request_id']
        //     ]);

        //     return response()->json(['status' => 'processed'], 200);
        // } catch (\Exception $th) {
        //     Log::error('Error processing Airalo webhook', [
        //         'error' => $th->getMessage(),
        //         'trace' => $th->getTraceAsString(),
        //         'request_data' => $request->all()
        //     ]);

        //     return response()->json([
        //         'status' => 'error',
        //         'message' => 'Internal server error'
        //     ], 500);
        // }
    }

    public function getLowData(Request $request)
    {
        try {
            $data = $request->all();
            // Basic validation for low data webhook
            // $validator = Validator::make($request->all(), [
            //     'iccid' => 'nullable|string|max:255',
            //     'threshold' => 'nullable|numeric|min:0|max:100',
            //     'remaining_data' => 'nullable|numeric|min:0',
            //     'package_id' => 'nullable|string|max:255',
            //     'timestamp' => 'nullable|date',
            // ]);

            // if ($validator->fails()) {
            //     Log::error('Low data webhook validation failed', [
            //         'errors' => $validator->errors(),
            //         'request_data' => $request->all()
            //     ]);

            //     return response()->json([
            //         'success' => false,
            //         'errors' => $validator->errors()
            //     ], 400);
            // }

            // $data = $validator->validated();

            Log::info('Webhook Low Data received:', $data);

            return response()->json(['success' => true], 200);
        } catch (\Exception $th) {
            Log::error('Error processing low data webhook', [
                'error' => $th->getMessage(),
                'trace' => $th->getTraceAsString(),
                'request_data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Internal server error'
            ], 500);
        }
    }

    public function esimAccess(Request $request)
    {
        $data = $request->all();
        Log::info('Esim Webhook received:', $data);
    }
    public function esimGo(Request $request)
    {
        $data = $request->all();
        Log::info('EsimGo Webhook received:', $data);
    }
}
