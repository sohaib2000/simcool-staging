<?php

namespace App\Jobs;

use App\Models\InAppProduct;
use Google_Client;
use Google_Service_AndroidPublisher;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class DeleteInAppProductJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected string $sku;

    /**
     * Create a new job instance.
     */
    public function __construct(string $sku)
    {
        $this->sku = strtolower(str_replace('-', '_', $sku));
    }

    /**
     * Execute the job.
     */
    public function handle()
    {
        try {
            $androidPackageName = systemflag('androidPackageName');
            $client = new Google_Client();
            $client->setAuthConfig(storage_path('app/google/esim-firebase.json'));
            $client->addScope(\Google_Service_AndroidPublisher::ANDROIDPUBLISHER);
            $client->setAccessType('offline');

            $service = new \Google_Service_AndroidPublisher($client);

            if ($this->checkIfProductExists($service, $this->sku)) {
                $response = $service->inappproducts->delete(
                    $androidPackageName,
                    $this->sku
                );
                Log::info("In-app product Deleted", ['sku' => $this->sku, 'response' => $response]);
            } else {
                Log::info("In-app product not found");
            }
        } catch (\Google\Service\Exception $e) {
            $error = json_decode($e->getMessage(), true);
            Log::error("Google API Error", [
                'sku' => $this->sku,
                'message' => $error['error']['message'] ?? $e->getMessage(),
                'details' => $error
            ]);
        } catch (\Exception $e) {
            Log::error("General Error while creating in-app product", [
                'sku' => $this->sku,
                'message' => $e->getMessage()
            ]);
        }
    }
    private function checkIfProductExists($service, $sku): bool
    {
        try {
            $androidPackageName = systemflag('androidPackageName');
            $product = $service->inappproducts->get($androidPackageName, $sku);
            return !empty($product);
        } catch (\Google\Service\Exception $e) {
            if ($e->getCode() !== null && $e->getCode() === 404) {
                return false;
            }
            throw $e;
        }
    }
}
