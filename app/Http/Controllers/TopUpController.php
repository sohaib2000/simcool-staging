<?php

namespace App\Http\Controllers;

use App\Http\Resources\TopupResource;
use App\Models\TopupHistory;
use App\Services\AiraloService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class TopUpController extends BaseController
{
    public function topuplist(Request $request, AiraloService $airalo)
    {
        try {
            $request->validate([
                'iccid' => 'required|exists:user_esims,iccid',
            ]);
        } catch (ValidationException $e) {
            return $this->sendValidationError($e->validator);
        }
        try {
            $response = $airalo->getTopUp($request->iccid);
            return TopupResource::collection($response['data'])->additional([
                'success' => true,
                'message' => 'Top Up retrieved successfully.'
            ]);
        } catch (\Exception $th) {
            return $this->sendError($th->getMessage());
        }
    }

    public function topupStore(Request $request, AiraloService $airalo)
    {
        try {
            try {
                $request->validate([
                    'iccid' => 'required|exists:user_esims,iccid',
                    'topup_package_id' => 'required',
                ]);
            } catch (ValidationException $e) {
                return $this->sendValidationError($e->validator);
            }

        } catch (\Exception $th) {
            return $this->sendError($th->getMessage());
        }
    }
}
