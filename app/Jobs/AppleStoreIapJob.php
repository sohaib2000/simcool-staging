<?php

namespace App\Jobs;

use App\Models\InAppProduct;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AppleStoreIapJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected string $sku;
    protected string $title;
    protected string $description;
    protected float $price;
    protected string $currency;
    protected string $country;

    /**
     * Create a new job instance.
     */
    public function __construct(string $sku, string $title, string $description, float $price, string $currency = 'INR', string $country = 'IND')
    {
        $this->sku = strtolower(str_replace('-', '_', $sku));
        $this->title = $title;
        $this->description = $description;
        $this->price = $price;
        $this->currency = $currency;
        $this->country = $country;
    }

    /**
     * Execute the job.
     */
    public function handle()
    {
        try {
            $appId = systemflag('iosAppId');
            $bundleId =  systemflag('androidPackageName');
            $keyId = systemflag('iosKeyId');
            $issuerId = systemflag('iosIssuerId');
            // Generate JWT token for App Store Connect API
            $jwt = $this->generateAppleJWT($bundleId, $keyId, $issuerId);
            $this->createOrUpdateAppleInAppPurchase($jwt, $appId, $bundleId);
            InAppProduct::where('sku', $this->sku)->update(['isAppleUpload' => 1]);
        } catch (\Exception $e) {
            Log::error("Apple App Store API Error", [
                'sku' => $this->sku,
                'message' => $e->getMessage()
            ]);
        }
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
        $privateKeyPath = $keyDirectory . $keyId . '.p8';

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

    private function createOrUpdateAppleInAppPurchase($jwt, $appId, $productData)
    {
        try {
            // Step 1: Check if IAP already exists
            $existingIAP = $this->checkExistingIAP($jwt, $appId, $this->sku);

            if ($existingIAP) {
                Log::info('IAP already exists, updating...', ['iap_id' => $existingIAP['id']]);
                return $this->updateExistingIAP($jwt, $appId, $existingIAP['id']);
            }

            // Step 2: Create the IAP first
            $iapData = [
                'data' => [
                    'type' => 'inAppPurchases',
                    'attributes' => [
                        'productId' => $this->sku,
                        'name' => $this->title,
                        'inAppPurchaseType' => 'CONSUMABLE',
                        'reviewNote' => "Consumable item to recharge user balance via eSIM.\n\n"
                            . "How to test:\n"
                            . "1. Launch app → go to “Packages” tab.\n"
                            . "2. Select the package.\n"
                            . "3. Proceed with purchase via the App Store flow.\n"
                            . "4. After successful purchase, the eSIM QR code should be generated / delivered within the app.\n\n"
                            . "This is a consumable IAP and can be purchased multiple times.",
                    ],
                    'relationships' => [
                        'app' => [
                            'data' => [
                                'type' => 'apps',
                                'id' => $appId
                            ]
                        ]
                    ]
                ]
            ];

            $response = Http::withHeaders(['Authorization' => 'Bearer ' . $jwt, 'Content-Type' => 'application/json'])
                ->post('https://api.appstoreconnect.apple.com/v2/inAppPurchases', $iapData);

            if ($response->failed()) {
                $this->handleApiError($response, 'create IAP', $iapData);
            }

            $iapId = $response->json('data.id');
            Log::info('IAP created successfully', ['iap_id' => $iapId]);

            // Step 3: Fetch all territories to set worldwide availability
            $this->SetTerritory($jwt, $iapId);

            // Step 5: Set pricing for the IAP
            $priceResp = $this->setIAPPricing($jwt, $appId, $iapId);
            $priceSet = $this->price;
            if ($priceResp) {
                $priceSet = $priceResp['actual_price'];
            }
            // Step 6: Add Localization ONLY for en-US
            $localizationData = [
                'data' => [
                    'type' => 'inAppPurchaseLocalizations',
                    'attributes' => [
                        'name' => "eSIM Pack (" . $this->currency . ' ' . $priceSet . ")",
                        'description' => "Buy eSIM / Top-Up " . $this->currency . ' ' . $priceSet . "",
                        'locale' => 'en-US'
                    ],
                    'relationships' => [
                        'inAppPurchaseV2' => [
                            'data' => [
                                'type' => 'inAppPurchases',
                                'id' => $iapId
                            ]
                        ]
                    ]
                ]
            ];

            $localizationResponse = Http::withHeaders(['Authorization' => 'Bearer ' . $jwt, 'Content-Type' => 'application/json'])
                ->post('https://api.appstoreconnect.apple.com/v1/inAppPurchaseLocalizations', $localizationData);

            if ($localizationResponse->failed()) {
                $this->handleApiError($localizationResponse, 'create en-US localization', $localizationData);
            }

            Log::info('Localization created for en-US', ['iap_id' => $iapId]);
            $screenShotImage = storage_path('app/public/review_screenshots/' . $this->sku . '.png');
            $this->storeReviewScreeshoot($jwt, $screenShotImage, $iapId);
            return ['iap_id' => $iapId];
        } catch (\Exception $e) {
            Log::error('IAP creation process failed', ['error' => $e->getMessage()]);
            throw $e;
        }
    }

    /**
     * Check if IAP already exists
     */
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
                return $iap;
            }
        }

        return null;
    }


    /**
     * Update existing IAP
     */
    private function updateExistingIAP($jwt, $appId, $iapId)
    {
        // Update the existing IAP if needed
        $updateData = [
            'data' => [
                'type' => 'inAppPurchases',
                'id' => $iapId,
                'attributes' => [
                    'name' => $this->title,
                    'reviewNote' => "Consumable item to recharge user balance via eSIM.\n\n"
                        . "How to test:\n"
                        . "1. Launch app → go to “Packages” tab.\n"
                        . "2. Select the package.\n"
                        . "3. Proceed with purchase via the App Store flow.\n"
                        . "4. After successful purchase, the eSIM QR code should be generated / delivered within the app.\n\n"
                        . "This is a consumable IAP and can be purchased multiple times.",
                ]
            ]
        ];

        $response = Http::withHeaders(['Authorization' => 'Bearer ' . $jwt, 'Content-Type' => 'application/json'])
            ->patch("https://api.appstoreconnect.apple.com/v2/inAppPurchases/{$iapId}", $updateData);

        if ($response->failed()) {
            $this->handleApiError($response, 'update IAP', $updateData);
        }

        $priceRes = $this->setIAPPricing($jwt, $appId, $iapId);
        $this->UpdateLocalization($jwt, $iapId, $priceRes['actual_price']);
        $this->SetTerritory($jwt, $iapId);
        $screenShotImage = storage_path('app/public/review_screenshots/' . $this->sku . '.png');
        $this->storeReviewScreeshoot($jwt, $screenShotImage, $iapId);

        Log::info('IAP updated successfully', ['iap_id' => $iapId]);

        // Update pricing as well

        return ['iap_id' => $iapId];
    }

    /**
     * Set pricing for the IAP
     */
    private function setIAPPricing($jwt, $appId, $iapId)
    {
        try {
            // Step 1: Get app price points for INR
            $pricePointsResponse = Http::withHeaders(['Authorization' => 'Bearer ' . $jwt])
                ->get("https://api.appstoreconnect.apple.com/v2/inAppPurchases/{$iapId}/pricePoints?filter[territory]=" . $this->country . "&limit=800");
            if ($pricePointsResponse->failed()) {
                throw new \Exception('Failed to fetch ' . $this->currency . ' price points from API.');
            }

            // Step 2: Find the best matching price point for INR
            $pricePoints = $pricePointsResponse->json('data');
            $targetPrice = $this->price;
            $bestPricePoint = $this->findBestPricePoint($pricePoints, $targetPrice);
            if (!$bestPricePoint) {
                throw new \Exception('No suitable price point found for ' . $this->currency . $targetPrice);
            }

            Log::info('Selected price point', [
                'price_point_id' => $bestPricePoint['id'],
                'target_price' => $targetPrice,
                'actual_price' => $bestPricePoint['attributes']['customerPrice']
            ]);
            $tempPriceId = '${temp-price-' . uniqid() . '}';
            // Step 3: Create price schedule
            $priceScheduleData = [
                'data' => [
                    'type' => 'inAppPurchasePriceSchedules',
                    'relationships' => [
                        'inAppPurchase' => [
                            'data' => [
                                'type' => 'inAppPurchases',
                                'id' => $iapId
                            ]
                        ],
                        'baseTerritory' => [
                            'data' => [
                                'type' => 'territories',
                                'id' => $this->country
                            ]
                        ],
                        'manualPrices' => [
                            'data' => [
                                [
                                    'type' => 'inAppPurchasePrices',
                                    'id' => $tempPriceId
                                ]
                            ]
                        ]
                    ]
                ],
                'included' => [
                    [
                        'type' => 'inAppPurchasePrices',
                        'id' => $tempPriceId,
                        'attributes' => [
                            'startDate' => now('UTC')->subDay()->format('Y-m-d'),
                        ],
                        'relationships' => [
                            'inAppPurchasePricePoint' => [
                                'data' => [
                                    'type' => 'inAppPurchasePricePoints',
                                    'id' => $bestPricePoint['id']
                                ]
                            ],
                            'territory' => [
                                'data' => [
                                    'type' => 'territories',
                                    'id' => $this->country
                                ]
                            ]
                        ]
                    ]
                ]
            ];

            $priceResponse = Http::withHeaders(['Authorization' => 'Bearer ' . $jwt, 'Content-Type' => 'application/json'])
                ->post('https://api.appstoreconnect.apple.com/v1/inAppPurchasePriceSchedules', $priceScheduleData);

            if ($priceResponse->failed()) {
                $this->handleApiError($priceResponse, 'set IAP pricing', $priceScheduleData);
            }

            Log::info('IAP pricing set successfully', [
                'iap_id' => $iapId,
                'territory' => $this->country
            ]);
            InAppProduct::where('sku', $this->sku)->update(['set_price' => $bestPricePoint['attributes']['customerPrice']]);

            return [
                'iap_id' => $iapId,
                'actual_price' => $bestPricePoint['attributes']['customerPrice']
            ];
        } catch (\Exception $e) {
            Log::error('Failed to set IAP pricing', [
                'iap_id' => $iapId,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }
    private function UpdateLocalization($jwt, $iapId, $price)
    {
        try {
            $localresponse = Http::withHeaders(['Authorization' => 'Bearer ' . $jwt])
                ->get("https://api.appstoreconnect.apple.com/v2/inAppPurchases/{$iapId}/inAppPurchaseLocalizations");

            if ($localresponse->failed()) {
                Log::warning('Failed to get localization list', ['product_id' => $iapId]);
                return null;
            }

            $localResponseData = $localresponse->json('data');
            $localizationId = $localResponseData[0]['id'] ?? null;

            // CREATE localization if not exists
            if (!$localizationId) {

                $createData = [
                    'data' => [
                        'type' => 'inAppPurchaseLocalizations',
                        'attributes' => [
                            'name' => "eSIM Pack (" . $this->currency . $price . ")",
                            'description' => "Buy eSIM / Top-Up " . $this->currency . $price,
                            'locale' => "en-US"
                        ],
                        'relationships' => [
                            'inAppPurchaseV2' => [
                                'data' => [
                                    'type' => 'inAppPurchases',
                                    'id' => $iapId
                                ]
                            ]
                        ]
                    ]
                ];


                $createResp = Http::withHeaders(['Authorization' => 'Bearer ' . $jwt])
                    ->post('https://api.appstoreconnect.apple.com/v1/inAppPurchaseLocalizations', $createData);

                if ($createResp->failed()) {
                    $this->handleApiError($createResp, 'create localization', $createData);
                }

                $localizationId = $createResp->json('data.id');
            }

            // UPDATE localization
            $updateData = [
                'data' => [
                    'id' => $localizationId,
                    'type' => 'inAppPurchaseLocalizations',
                    'attributes' => [
                        'name' => "eSIM Pack (" . $this->currency . $price . ")",
                        'description' => "Buy eSIM / Top-Up " . $this->currency . $price,
                    ]
                ]
            ];

            $updateResp = Http::withHeaders(['Authorization' => 'Bearer ' . $jwt])
                ->patch("https://api.appstoreconnect.apple.com/v1/inAppPurchaseLocalizations/{$localizationId}", $updateData);

            if ($updateResp->failed()) {
                $this->handleApiError($updateResp, 'update localization', $updateData);
            }

            Log::info('IAP localization updated', ['iap_id' => $iapId]);
        } catch (\Exception $e) {
            Log::error('Failed to update localization', [
                'iap_id' => $iapId,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    private function SetTerritory($jwt, $iapId)
    {
        try {
            $territoriesResponse = Http::withHeaders(['Authorization' => 'Bearer ' . $jwt])
                ->get('https://api.appstoreconnect.apple.com/v1/territories?limit=200');

            if ($territoriesResponse->failed()) {
                throw new \Exception('Failed to fetch territories from API.');
            }

            $allTerritories = array_map(function ($item) {
                return ['type' => 'territories', 'id' => $item['id']];
            }, $territoriesResponse->json('data'));

            // Step 4: Set Availability for ALL territories
            $availabilityData = [
                'data' => [
                    'type' => 'inAppPurchaseAvailabilities',
                    'attributes' => [
                        'availableInNewTerritories' => true,
                    ],
                    'relationships' => [
                        'inAppPurchase' => [
                            'data' => [
                                'type' => 'inAppPurchases',
                                'id' => $iapId
                            ]
                        ],
                        'availableTerritories' => [
                            'data' => $allTerritories
                        ]
                    ]
                ]
            ];

            $availabilityResponse = Http::withHeaders(['Authorization' => 'Bearer ' . $jwt, 'Content-Type' => 'application/json'])
                ->post('https://api.appstoreconnect.apple.com/v1/inAppPurchaseAvailabilities', $availabilityData);

            if ($availabilityResponse->failed()) {
                $this->handleApiError($availabilityResponse, 'set availability', $availabilityData);
            }

            Log::info('IAP availability set for all territories.', ['iap_id' => $iapId]);
        } catch (\Exception $e) {
            Log::error('Failed to set Territory', [
                'iap_id' => $iapId,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Find the best matching price point for the target price
     */
    private function findBestPricePoint($pricePoints, $targetPrice)
    {
        $bestMatch = null;

        foreach ($pricePoints as $pricePoint) {
            if (isset($pricePoint['attributes']['customerPrice'])) {
                $priceValue = floatval($pricePoint['attributes']['customerPrice']);

                // Only consider prices >= target
                if ($priceValue >= $targetPrice) {
                    if ($bestMatch === null || $priceValue < floatval($bestMatch['attributes']['customerPrice'])) {
                        $bestMatch = $pricePoint;
                    }
                }
            }
        }

        return $bestMatch;
    }


    private function handleApiError($response, $step, $requestData)
    {
        $errorResponse = $response->json();
        $statusCode = $response->status();

        Log::error("Failed to {$step}", [
            'status_code' => $statusCode,
            'response' => $response->body(),
            'request_data' => $requestData,
            'errors' => $errorResponse['errors'] ?? []
        ]);

        // Handle specific error codes if needed
        if ($statusCode === 409 && $step === 'create IAP') {
            throw new \Exception("In-app purchase with this product ID already exists.");
        }

        throw new \Exception("Failed to {$step}. Status: {$statusCode}. Check logs for details.");
    }

    private function storeReviewScreeshoot($jwt, $imagePath, $iapId)
    {
        // STEP 1 — check if screenshot exists
        $existingId = $this->getExistingScreenshotId($jwt, $iapId);

        if ($existingId) {
            // delete it before uploading a new one
            $del = $this->deleteScreenshot($jwt, $existingId);

            if ($del->failed()) {
                throw new \Exception("Failed to delete existing screenshot: " . $del->body());
            }
        }

        // STEP 2 — create NEW screenshot reservation
        $reserveResponse = Http::withToken($jwt)->post(
            'https://api.appstoreconnect.apple.com/v1/inAppPurchaseAppStoreReviewScreenshots',
            [
                'data' => [
                    'type' => 'inAppPurchaseAppStoreReviewScreenshots',
                    'attributes' => [
                        'fileName' => basename($imagePath),
                        'fileSize' => filesize($imagePath),
                    ],
                    'relationships' => [
                        'inAppPurchaseV2' => [
                            'data' => [
                                'type' => 'inAppPurchases',
                                'id' => $iapId,
                            ],
                        ],
                    ],
                ],
            ]
        );

        if ($reserveResponse->failed()) {
            throw new \Exception("Failed to reserve screenshot: " . $reserveResponse->body());
        }

        $uploadOp = $reserveResponse->json('data.attributes.uploadOperations.0');
        $uploadUrl = $uploadOp['url'];

        // STEP 3 — upload to S3
        $fileContents = file_get_contents($imagePath);
        $contentType = mime_content_type($imagePath) ?: 'application/octet-stream';

        $uploadResponse = Http::withHeaders([
            'Content-Type' => $contentType,
        ])->withBody($fileContents, $contentType)->put($uploadUrl);

        if ($uploadResponse->failed()) {
            throw new \Exception('Upload failed: ' . $uploadResponse->body());
        }

        // STEP 4 — commit upload
        $screenshotId = $reserveResponse->json('data.id');

        $commit = Http::withToken($jwt)->patch(
            "https://api.appstoreconnect.apple.com/v1/inAppPurchaseAppStoreReviewScreenshots/{$screenshotId}",
            [
                'data' => [
                    'type' => 'inAppPurchaseAppStoreReviewScreenshots',
                    'id' => $screenshotId,
                    'attributes' => [
                        'uploaded' => true,
                    ],
                ],
            ]
        );

        return [
            'deleted_old' => $existingId ?: 'none',
            'reserved' => $reserveResponse->json(),
            'uploaded' => $uploadResponse->status(),
            'committed' => $commit->json(),
        ];
    }
    private function getExistingScreenshotId($jwt, $iapId)
    {
        $resp = Http::withToken($jwt)
            ->get("https://api.appstoreconnect.apple.com/v1/inAppPurchases/{$iapId}/inAppPurchaseAppStoreReviewScreenshots");

        if ($resp->failed()) {
            return null;
        }

        $data = $resp->json('data');

        return $data[0]['id'] ?? null;
    }
    private function deleteScreenshot($jwt, $screenshotId)
    {
        return Http::withToken($jwt)
            ->delete("https://api.appstoreconnect.apple.com/v1/inAppPurchaseAppStoreReviewScreenshots/{$screenshotId}");
    }
}
