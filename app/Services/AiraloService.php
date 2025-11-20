<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class AiraloService
{
    protected $baseUrl;
    protected $clientId;
    protected $clientSecret;
    protected $grantType;

    public function __construct()
    {
        $this->baseUrl = systemflag('AiraloBaseUrl') ?? '/';
        $this->clientId = systemflag('AiraloClientId') ?? '';
        $this->clientSecret = systemflag('AiraloClientSecretKey') ?? '';
        $this->grantType = systemflag('AiraloGrantType') ?? 'client_credentials';
    }

    /**
     * Get and cache OAuth2 access token (cache for 55 mins / 3300 seconds)
     */
    public function getAccessToken()
    {
        $tokenUrl = $this->baseUrl . '/token';

        return Cache::remember('airalo_access_token', 3300, function () use ($tokenUrl) {
            $response = Http::asJson()->post($tokenUrl, [
                'grant_type' => $this->grantType,
                'client_id' => $this->clientId,
                'client_secret' => $this->clientSecret,
            ]);

            if (!$response->ok() || !isset($response['data']['access_token'])) {
                throw new \Exception('Airalo auth failed: ' . $response->body());
            }

            return $response['data']['access_token'];
        });
    }

    /**
     * Get packages from Airalo (GET /packages)
     */
    public function getPackages(array $request)
    {
        $token = $this->getAccessToken();

        $filters = [];
        $page = 1;

        if (!empty($request['type'])) {
            $filters['type'] = $request['type'];
        }

        if (!empty($request['country'])) {
            $filters['country'] = $request['country'];
        }
        if (!empty($request['page'])) {
            $page = $request['page'];
        }
        if (!empty($request['include'])) {
            $include = $request['include'];
        }

        $response = Http::withToken($token)->get($this->baseUrl . '/packages', [
            'filter' => $filters,
            'page' => $page,
            'include' => $include
        ]);

        if ($response->failed()) {
            throw new \Exception('Airalo getPackages failed: ' . $response->body());
        }

        return $response;
    }


    /**
     * Place an order for an eSIM (POST /orders)
     * @param string $packageId Airalo package ID
     * @param array $userData ['email'=>..., 'name'=>..., ...]
     */
    public function placeOrder($packageId, $userData = [])
    {
        $token = $this->getAccessToken();

        $payload = [
            'package_id'     => $packageId,
            'customer_email' => $userData['email'] ?? 'demo@example.com',
            'quantity'       => 1,
        ];
        $response = Http::withToken($token)
            ->post($this->baseUrl . '/orders', $payload);

        if ($response->failed()) {
            throw new \Exception('Airalo placeOrder failed: ' . $response->body());
        }

        return $response->json();
    }
    public function placeAsyncOrder($packageId, $userData = [])
    {
        $token = $this->getAccessToken();

        $payload = [
            'package_id'     => $packageId,
            'quantity'       => 1,
            'type'           => 'sim',
            'webhook_url'    => route('async.order')
        ];
        $response = Http::withToken($token)
            ->post($this->baseUrl . '/orders-async', $payload);

        if ($response->failed()) {
            throw new \Exception('Airalo placeOrder failed: ' . $response->body());
        }

        return $response->json('data') ?? $response->json();
    }

    /**
     * Get order status/details from Airalo (GET /orders/{id})
     */
    public function getOrderStatus($orderId)
    {
        $token = $this->getAccessToken();

        $response = Http::withToken($token)
            ->get($this->baseUrl . '/orders/' . $orderId,[
                'include' => 'status'
            ]);

        if ($response->failed()) {
            throw new \Exception('Airalo getOrderStatus failed: ' . $response->body());
        }

        return $response->json();
    }

    /**
     * Activate eSIM (POST /sims/{iccid}/activate)
     */
    public function activateEsim($iccid)
    {
        $token = $this->getAccessToken();
        $response = Http::withToken($token)
            ->post($this->baseUrl . '/sims/' . $iccid . '/activate');

        if ($response->failed()) {
            throw new \Exception('Airalo activateEsim failed: ' . $response->body());
        }

        return $response->json();
    }

    public function getEsimUsage($iccid)
    {
        $token = $this->getAccessToken();
        $response = Http::withToken($token)
            ->get($this->baseUrl . '/sims/' . $iccid);

        if ($response->failed()) {
            throw new \Exception('Airalo getEsimDetails failed: ' . $response->body());
        }

        return $response->json();
    }
    public function getTopUp($iccid)
    {
        $token = $this->getAccessToken();
        $response = Http::withToken($token)
            ->get($this->baseUrl . '/sims/' . $iccid . '/topups');

        if ($response->failed()) {
            throw new \Exception('Airalo topup failed: ' . $response->body());
        }

        return $response->json();
    }
    public function storeTopUp($packageId, $iccid)
    {
        $token = $this->getAccessToken();
        $payload = [
            'package_id'     => $packageId,
            'iccid'          => $iccid,
        ];
        $response = Http::withToken($token)
            ->post($this->baseUrl . '/orders/topups', $payload);
        if ($response->failed()) {
            throw new \Exception('Airalo store topup failed: ' . $response->body());
        }

        return $response->json();
    }
    public function getUsage($iccid)
    {
        $token = $this->getAccessToken();
        $response = Http::withToken($token)
            ->get($this->baseUrl . '/sims/' . $iccid . '/usage');

        if ($response->failed()) {
            throw new \Exception('Airalo Usage data failed: ' . $response->body());
        }

        return $response->json();
    }
    public function getorderList($iccid)
    {
        $token = $this->getAccessToken();
        $response = Http::withToken($token)
            ->get($this->baseUrl . '/orders');

        if ($response->failed()) {
            throw new \Exception('Airalo topup failed: ' . $response->body());
        }

        return $response->json();
    }
    public function getEsimDetails($iccid)
    {
        $token = $this->getAccessToken();
        $response = Http::withToken($token)
            ->get($this->baseUrl . '/sims/' . $iccid . '/packages');

        if ($response->failed()) {
            throw new \Exception('Airalo topup failed: ' . $response->body());
        }

        return $response->json();
    }
    public function deviceCompatible()
    {
        $token = $this->getAccessToken();
        $response = Http::withToken($token)
            ->get($this->baseUrl . '/compatible-devices');

        if ($response->failed()) {
            throw new \Exception('Airalo device compatible failed: ' . $response->body());
        }

        return $response->json();
    }
    public function instructions($iccid)
    {
        $token = $this->getAccessToken();
        $response = Http::withToken($token)
            ->get($this->baseUrl . '/sims/' . $iccid . '/instructions');

        if ($response->failed()) {
            throw new \Exception('Airalo instructions failed: ' . $response->body());
        }

        return $response->json();
    }
}
