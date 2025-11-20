<?php

namespace App\Services;

use Google_Client;
use Google_Service_AndroidPublisher;

class GooglePlayService
{
    protected $sku;
    protected $currency;

    public function __construct($sku, $currency)
    {
        $this->sku   = $sku;
        $this->currency  = $currency;
    }

    /**
     * Create Cashfree order
     */
    public function priceGet()
    {
        $androidPackageName = systemflag('androidPackageName');
        $client = new Google_Client();
        $client->setAuthConfig(storage_path('app/google/firebase.json'));
        $client->addScope(\Google_Service_AndroidPublisher::ANDROIDPUBLISHER);
        $client->setAccessType('offline');
        $service = new \Google_Service_AndroidPublisher($client);
        $product = $service->inappproducts->get($androidPackageName, $this->sku);

        foreach($product['prices'] as $key => $prd){
            if($prd['currency'] == $this->currency){
                return $prd['priceMicros']/1000000;
            }
        }
    }

}
