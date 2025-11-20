<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class EsimGoService
{
    protected $baseUrl;
    protected $esimGoKey;

    public function __construct()
    {
        $this->baseUrl = systemflag('esimGoApiUrl') ?? '/';
        $this->esimGoKey = systemflag('esimGoKey') ?? '';
    }

    /**
     * Get packages from Airalo (GET /packages)
     */
    public function getPackages(array $request)
    {

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'X-API-Key' => $this->esimGoKey
        ])->get($this->baseUrl . '/catalogue', $request);

        if ($response->failed()) {
            throw new \Exception('Esim Accesss getPackages failed: ' . $response->body());
        }
        if ($response->successful()) {
            return json_decode($response->body());
        }

        throw new \Exception('EsimGo getPackages failed: ' . $response->body());
    }

    public function placeOrder($packageId, $iccid = '')
    {
        $data = [];
        if(!empty($iccid)){
            $data = [
                (string) $iccid
            ];
        }
        $payload = [
            'type' => 'transaction',
            'assign' => true,
            'order' => [
                [
                    'type'     => 'bundle',
                    'quantity' => 1,
                    'item'     => $packageId,
                    "iccids" => $data,
                    'allowReassign' => false
                ]
            ],
            'profileID' => ''
        ];
        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'X-API-Key' => $this->esimGoKey
        ])->post($this->baseUrl . '/orders', $payload);

        if ($response->failed()) {
            throw new \Exception('Esim Go Order failed: ' . $response->body());
        }
        if ($response->successful()) {
            return json_decode($response->body());
        }

        throw new \Exception('Esim Go Order failed: ' . $response->body());
    }
    public function getEsimDetails($iccid = null)
    {
        if (!$iccid) {
            throw new \Exception('Esim Go ICCID not found');
        }
        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'X-API-Key' => $this->esimGoKey
        ])->get($this->baseUrl . '/esims/' . $iccid,['additionalFields' => 'appleInstallUrl']);

        if ($response->failed()) {
            throw new \Exception('Esim Go esim details failed: ' . $response->body());
        }
        if ($response->successful()) {
            return json_decode($response->body());
        }

        throw new \Exception('Esim Go esim details failed: ' . $response->body());
    }
}
