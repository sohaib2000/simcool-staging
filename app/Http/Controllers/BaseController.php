<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;

class BaseController extends Controller
{
    /**
     * Success response
     */
    public function sendResponse($result, $message = '', $code = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $result,
            'message' => $message,
        ], $code);
    }

    /**
     * Error response
     */
    public function sendError($error, $code = 400, $data = []): JsonResponse
    {
        $response = [
            'success' => false,
            'message' => $error,
        ];

        if (!empty($data)) {
            $response['data'] = $data;
        }

        return response()->json($response, $code);
    }

    /**
     * Validation failure response
     */
    public function sendValidationError($validator): JsonResponse
    {
        return $this->sendError('Validation Error', 422, $validator->errors());
    }
}

