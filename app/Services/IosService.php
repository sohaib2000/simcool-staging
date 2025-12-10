<?php

namespace App\Services;

use Google_Client;
use Google_Service_AndroidPublisher;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class IosService
{
    protected $sku;
    protected $country;

    public function __construct($sku, $country)
    {
        $this->sku   = $sku;
        $this->country  = $country;

    }

    /**
     * Create Cashfree order
     */
    public function priceGet()
    {
        $appId = systemflag('iosAppId');
        $bundleId =  systemflag('androidPackageName');
        $keyId = systemflag('iosKeyId');
        $issuerId = systemflag('iosIssuerId');

        $jwt = $this->generateAppleJWT($bundleId, $keyId, $issuerId);
        $iap = $this->checkExistingIAP($jwt, $appId, $this->sku);
       // dd($iap);
        $response = Http::withHeaders(['Authorization' => 'Bearer ' . $jwt])
            ->get("https://api.appstoreconnect.apple.com/v1/inAppPurchasePriceSchedules/{$iap}/manualPrices", ['include' =>  'inAppPurchasePricePoint']);

        if ($response->failed()) {
            Log::warning('Failed to check existing IAP', ['product_id' =>  $this->sku]);
            return null;
        }

        $data = $response->json('included');
        $priceUrl = '';
        foreach ($data as $res) {
            if (isset($res['relationships']['equalizations']['links'])) {
                $priceUrl = $res['relationships']['equalizations']['links']['related'];
            }
        }

       $response2 = Http::withHeaders(['Authorization' => 'Bearer ' . $jwt])
            ->get($priceUrl, ['filter[territory]' =>  $this->country]);
        $data2 = $response2->json('data');
         foreach ($data2 as $price) {
            if (isset($price['attributes']['customerPrice'])) {
                $GetPrice = $price['attributes']['customerPrice'];
            }
        }
        return $GetPrice;

    }

    private function generateAppleJWT($bundleId, $keyId, $issuerId)
    {
        // Debug: Check if values are properly set
        if (empty($keyId) || empty($issuerId)) {
            Log::error('Apple JWT Config Missing', [
                'keyId' => $keyId,
                'issuerId' => $issuerId
            ]);
            throw new \Exception("Apple Key ID or Issuer ID is missing");
        }

        $keyDirectory = storage_path('app/apple/');
        $p8Files = glob($keyDirectory .$keyId . '.p8');

        if (empty($p8Files)) {
            throw new \Exception("No .p8 files found in: " . $keyDirectory);
        }

        $privateKeyPath = $p8Files[0];

        if (!file_exists($privateKeyPath)) {
            throw new \Exception("Apple private key file not found at: " . $privateKeyPath);
        }

        $privateKey = file_get_contents($privateKeyPath);

        // Validate private key format
        if (strpos($privateKey, '-----BEGIN PRIVATE KEY-----') === false) {
            throw new \Exception("Invalid private key format. Make sure it's a valid .p8 file.");
        }

        $now = time();
        $payload = [
            'iss' => $issuerId,
            'iat' => $now,
            'exp' => $now + (20 * 60),
            'aud' => 'appstoreconnect-v1',
            "bid" => $bundleId
        ];

        try {
            // Generate JWT - for ES256, we only need to pass the algorithm and keyId
            $jwt = \Firebase\JWT\JWT::encode($payload, $privateKey, 'ES256', $keyId);

            // Debug log (remove in production)
            Log::info('JWT Generated Successfully', [
                'iat' => $payload['iat'],
                'exp' => $payload['exp'],
            ]);

            return $jwt;
        } catch (\Exception $e) {
            Log::error('JWT Generation Failed', [
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    private function checkExistingIAP($jwt, $appId, $productId)
    {
        $response = Http::withHeaders(['Authorization' => 'Bearer ' . $jwt])
            ->get("https://api.appstoreconnect.apple.com/v1/apps/{$appId}/inAppPurchasesV2", ['filter[productId]' => $productId]);

        if ($response->failed()) {
            Log::warning('Failed to check existing IAP', ['product_id' => $productId]);
            return null;
        }

        $data = $response->json('data');
        foreach ($data as $iap) {
            if (isset($iap['attributes']['productId']) && $iap['attributes']['productId'] === $productId) {
                return $iap['id'];
            }
        }

        return null;
    }
}
