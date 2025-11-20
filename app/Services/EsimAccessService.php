<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class EsimAccessService
{
    protected $baseUrl;
    protected $accessCode;
    protected $esimSecretKey;
    protected $imageBaseUrl;

    public function __construct()
    {
        $this->baseUrl = systemflag('esimAccessApiUrl') ?? '/';
        $this->accessCode = systemflag('esimAccessCode') ?? '';
        $this->esimSecretKey = systemflag('esimSecretKey') ?? '';
        $this->imageBaseUrl = 'https://static.redteago.com';
    }

    /**
     * Get packages from Airalo (GET /packages)
     */
    public function getPackages(array $request)
    {

        $locationCode = '';
        $type = '';
        $packageCode = '';
        $slug = '';
        $iccid = '';

        if (!empty($request['locationCode'])) {
            $locationCode = $request['locationCode'];
        }
        if (!empty($request['type'])) {
            $type = $request['type'];
        }
        if (!empty($request['packageCode'])) {
            $packageCode = $request['packageCode'];
        }
        if (!empty($request['slug'])) {
            $slug = $request['slug'];
        }
        if (!empty($request['iccid'])) {
            $iccid = $request['iccid'];
        }

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'RT-AccessCode' => $this->accessCode
        ])->post($this->baseUrl . '/open/package/list', [
            'locationCode' => $locationCode,
            'type' => $type,
            'packageCode' => $packageCode,
            'slug' => $slug,
            'iccid' => $iccid
        ]);

        if ($response->failed()) {
            throw new \Exception('Esim Accesss getPackages failed: ' . $response->body());
        }
        $data = json_decode($response->body());
        if ($data->success == true) {
            return $data->obj;
        }
        throw new \Exception('Esim Accesss getPackages failed: ' . $response->body());
    }
    public function getLocations(array $request)
    {
        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'RT-AccessCode' => $this->accessCode
        ])->post($this->baseUrl . '/open/location/list', [
            'type' => ''
        ]);

        if ($response->failed()) {
            throw new \Exception('Esim Accesss getlocation failed: ' . $response->body());
        }
        $data = json_decode($response->body());
        if ($data->success == true) {
            return $data->obj;
        }
        throw new \Exception('Esim Accesss getlocation failed: ' . $response->body());
    }

    public function placeOrder($transactionId = null, $packageId)
    {
        if (!$transactionId) {
            $transactionId =  now()->format('Ymd') . '-' . strtoupper(uniqid());
        }

        $payload = [
            'transactionId' => $transactionId,
            'packageInfoList' => [
                [
                    'packageCode' => $packageId,
                    'count' => 1,
                ]
            ],
        ];
        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'RT-AccessCode' => $this->accessCode
        ])->post($this->baseUrl . '/open/esim/order', $payload);

        if ($response->failed()) {
            throw new \Exception('Esim Accesss Order failed: ' . $response->body());
        }
        $data = json_decode($response->body());
        if ($data->success == true) {
            return $data->obj;
        }

        throw new \Exception('Esim Accesss Order failed: ' . $response->body());
    }
    public function storeTopUp($transactionId = null, $packageId, $esimTranNo)
    {
        if (!$transactionId) {
            $transactionId =  now()->format('Ymd') . '-' . strtoupper(uniqid());
        }

        $payload = [
            'esimTranNo' => $esimTranNo,
            'transactionId' => $transactionId,
            'packageCode' => $packageId,

        ];
        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'RT-AccessCode' => $this->accessCode
        ])->post($this->baseUrl . '/open/esim/topup', $payload);

        if ($response->failed()) {
            throw new \Exception('Esim Accesss Order failed: ' . $response->body());
        }
        $data = json_decode($response->body());
        if ($data->success == true) {
            return $data->obj;
        }

        throw new \Exception('Esim Accesss Order failed: ' . $response->body());
    }
    public function getEsimDetails($esimOrderNo = null)
    {
        if (!$esimOrderNo) {
            throw new \Exception('Esim access OrderNo not found');
        }

        $payload = [
            'orderNo' => $esimOrderNo,
            'pager' => [
                'pageSize' => 50,
                'pageNum' => 1,
            ],
        ];
        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'RT-AccessCode' => $this->accessCode
        ])->post($this->baseUrl . '/open/esim/query', $payload);

        if ($response->failed()) {
            throw new \Exception('Esim Accesss Order details failed: ' . $response->body());
        }
        $data = json_decode($response->body());
        if ($data->success == true) {
            return $data->obj->esimList;
        }

        throw new \Exception('Esim Accesss Order details failed: ' . $response->body());
    }
    public function getUsage($esimTranNo = null)
    {
        if (!$esimTranNo) {
            throw new \Exception('Esim access OrderNo not found');
        }

        $payload = [
            'esimTranNoList' => [
               $esimTranNo
            ]
        ];
        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'RT-AccessCode' => $this->accessCode
        ])->post($this->baseUrl . '/open/esim/usage/query', $payload);

        if ($response->failed()) {
            throw new \Exception('Esim Accesss Order details failed: ' . $response->body());
        }
        $data = json_decode($response->body());
        if ($data->success == true) {
            return $data->obj->esimUsageList;
        }

        throw new \Exception('Esim Accesss Order details failed: ' . $response->body());
    }
}
