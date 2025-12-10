<?php

namespace App\Jobs;

use App\Models\InAppProduct;
use Google_Client;
use Google_Service_AndroidPublisher;
use Google_Service_AndroidPublisher_InAppProduct;
use Google_Service_AndroidPublisher_Price;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class CreateInAppProductJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected string $sku;
    protected string $title;
    protected string $description;
    protected float $price;
    protected string $currency;

    /**
     * Create a new job instance.
     */
    public function __construct(string $sku, string $title, string $description, float $price, string $currency = 'INR')
    {
        $this->sku = strtolower(str_replace('-', '_', $sku));
        $this->title = $title;
        $this->description = $description;
        $this->price = $price;
        $this->currency = $currency;
    }

    public function handle()
    {
        try {
            $androidPackageName = systemflag('androidPackageName');

            $client = new \Google\Client();
            $client->setAuthConfig(storage_path('app/google/firebase.json'));
            $client->addScope(\Google\Service\AndroidPublisher::ANDROIDPUBLISHER);
            $client->setAccessType('offline');

            $service = new \Google\Service\AndroidPublisher($client);

            $price = (float) $this->price;
            $priceMicros = (int) round($price * 1_000_000);

            $defaultPrice = new \Google\Service\AndroidPublisher\Money();
            $defaultPrice->setCurrencyCode($this->currency);
            $defaultPrice->setUnits((int)$price);
            $defaultPrice->setNanos(($price - (int)$price) * 1_000_000_000);

            // New schema for latest API
            $inAppProduct = new \Google\Service\AndroidPublisher\InAppProduct([
                'sku'             => $this->sku,
                'status'          => 'active',
                'defaultLanguage' => 'en-US',
                'defaultPrice'    => $defaultPrice,
                'listings'        => [
                    'en-US' => new \Google\Service\AndroidPublisher\InAppProductListing([
                        'title'       => $this->title,
                        'description' => $this->description,
                    ]),
                ],
            ]);

            Log::info('Preparing in-app product', [
                'sku' => $this->sku,
                'price' => $this->price,
                'currency' => $this->currency,
                'packageName' => $androidPackageName
            ]);

            if ($this->checkIfProductExists($service, $this->sku)) {
                // Update existing product
                $response = $service->inappproducts->update(
                    $androidPackageName,
                    $this->sku,
                    $inAppProduct
                );
                Log::info("In-app product updated", [
                    'sku' => $this->sku,
                    'response' => json_encode($response)
                ]);
            } else {
                // Insert new product
                $response = $service->inappproducts->insert(
                    $androidPackageName,
                    $inAppProduct
                );
                Log::info("In-app product created", [
                    'sku' => $this->sku,
                    'response' => json_encode($response)
                ]);
            }

            InAppProduct::where('sku', $this->sku)->update(['isAndroidUpload' => 1]);
        } catch (\Google\Service\Exception $e) {
            $error = json_decode($e->getMessage(), true);
            $message = $error['error']['message'] ?? $e->getMessage();

            Log::error("Google API Error", [
                'sku' => $this->sku,
                'code' => $e->getCode(),
                'message' => $message,
                'details' => $error
            ]);

            // Debug 403 errors
            if ($e->getCode() === 403) {
                Log::error("403 Forbidden - Check:", [
                    'issue_1' => 'Is GCP project linked in Play Console?',
                    'issue_2' => 'Does service account have androidpublisher scope?',
                    'issue_3' => 'Is service account invited in Play Console with permissions?',
                    'issue_4' => 'Is the app published (not in private alpha)?',
                ]);
            }
        } catch (\Exception $e) {
            Log::error("General Error while creating in-app product", [
                'sku' => $this->sku,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    private function checkIfProductExists($service, $sku)
    {
        try {
            $androidPackageName = systemflag('androidPackageName');
            $service->inappproducts->get($androidPackageName, $sku);
            return true;
        } catch (\Google\Service\Exception $e) {
            if ($e->getCode() === 404) {
                return false;
            }
            throw $e;
        }
    }
}
