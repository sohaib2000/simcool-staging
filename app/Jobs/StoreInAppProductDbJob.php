<?php

namespace App\Jobs;

use App\Models\Currency;
use App\Models\InAppProduct;
use App\Services\DynamicPriceImageGenerator;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class StoreInAppProductDbJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $currency;
    protected $priceGap;
    protected $slotsCount;

    /**
     * Create a new job instance.
     */
    public function __construct($currency, $priceGap, $slotsCount)
    {
        $this->currency = $currency;
        $this->priceGap = $priceGap;
        $this->slotsCount = $slotsCount;
    }

    public function handle(): void
    {
        // Lock to prevent concurrent overlap
        $lock = Cache::lock('store_inapp_products_lock', 20);

        try {
            if ($lock->get()) {

                $getCurrency = Currency::findOrFail($this->currency);

                $last = InAppProduct::orderBy('id', 'desc')->first();
                $baseStart = ($last && isset($last->max_price)) ? floatval($last->max_price) : 0.0;
                $gap = floatval($this->priceGap);
                $count = intval($this->slotsCount);
                $templatePath = storage_path('app/templates/review_image.png');
                $iosReviewImage = new DynamicPriceImageGenerator();

                $rows = [];

                for ($i = 0; $i < $count; $i++) {
                    $min = $baseStart + ($i * $gap);
                    $max = $min + $gap - (is_float($gap) && $gap < 1 ? 0.01 : 1);

                    // Round to 2 decimals if float, else keep integer
                    $min = ($gap < 1 || fmod($gap, 1) != 0) ? round($min, 2) : intval($min);
                    $max = ($gap < 1 || fmod($gap, 1) != 0) ? round($max, 2) : intval($max);
                    $name = "range_between_{$min}_to_{$max}";

                    // Avoid duplicate SKUs
                    if (InAppProduct::where('sku', $name)->exists()) {
                        Log::warning("Duplicate SKU skipped: {$name}");
                        continue;
                    }

                    // Safe image generation
                    try {
                        $reviewImage = $iosReviewImage->generatePriceImageWithGD($templatePath, $max, $name);
                    } catch (\Throwable $e) {
                        Log::error("Image generation failed for {$name}: " . $e->getMessage());
                        $reviewImage = null;
                    }

                    $rows[] = [
                        'currency_id' => $getCurrency->id,
                        'name' => $name,
                        'sku' => $name,
                        'min_price' => $min,
                        'max_price' => $max,
                        'set_price' => $max,
                        'isActive' => 1,
                        'ios_review_image' => $reviewImage,
                        'isAndroidUpload' => 0,
                        'isAppleUpload' => 0,
                        'created_at' => now(),
                        'updated_at' => now()
                    ];
                }

                if (!empty($rows)) {
                    DB::transaction(function () use ($rows) {
                        InAppProduct::insert($rows);
                    });
                    Log::info("Inserted " . count($rows) . " in-app products successfully.");
                } else {
                    Log::info("No new in-app products to insert.");
                }
            } else {
                Log::warning('StoreInAppProductDbJob skipped — lock not acquired.');
            }
        } catch (\Throwable $e) {
            Log::error('StoreInAppProductDbJob failed: ' . $e->getMessage());
        } finally {
            optional($lock)->release();
        }
    }
}
