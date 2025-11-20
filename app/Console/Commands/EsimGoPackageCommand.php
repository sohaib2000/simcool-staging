<?php

namespace App\Console\Commands;

use App\Jobs\CreateInAppProductJob;
use App\Models\Country;
use App\Models\EsimPackage;
use App\Models\Operator;
use App\Models\Region;
use App\Services\AiraloService;
use App\Services\EsimGoService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class EsimGoPackageCommand extends Command
{
    protected $signature = 'esimgo:sync-packages';
    protected $description = 'Sync eSIMgo packages with local database';

    public function handle()
    {
        $this->info('🔄 Starting eSIMgo package sync...');

        try {
            $esimgoService = new EsimGoService();
            $count = 0;
            $page = 1;

            do {
                $this->info("📦 Fetching page {$page}...");
                $response = $esimgoService->getPackages([
                    'page' => $page,
                    'perPage' => 500,
                ]);

                // Check if response has bundles
                if (empty($response->bundles)) {
                    $this->warn('⚠️ No more bundles found.');
                    break;
                }

                foreach ($response->bundles as $data) {
                    // Defensive checks for nullable or missing properties
                    $countries = $data->countries ?? [];
                    $speed = $data->speed ?? null;
                    $price = (float)($data->price ?? 0);
                    $duration = (int)($data->duration ?? 0);
                    $unlimited = (bool)($data->unlimited ?? false);
                    $dataAmount = $data->dataAmount ?? 0;

                    // Create or fetch existing package
                    $esimPackage = EsimPackage::firstOrNew(['package_id' => $data->name]);

                    $pkgAttrs = [
                        'package_id' => $data->name,
                        'name' => $data->description ?? $data->name,
                        'operator_id' => 0,
                        'type' => 'sim',
                        'price' => $price,
                        'amount' => $price,
                        'day' => $duration,
                        'is_unlimited' => $unlimited ? 1 : 0,
                        'short_info' => $data->description ?? '',
                        'qr_installation' => null,
                        'manual_installation' => null,
                        'is_fair_usage_policy' => 0,
                        'fair_usage_policy' => null,
                        'data' => $unlimited ? 'Unlimited' : ($dataAmount / 1000) . ' GB',
                        'net_price' => $price,
                        'prices' => null,
                        'country' => !empty($countries) ? json_encode($countries) : null,
                        'speed' => $speed ? json_encode($speed) : null,
                        'esim_provider' => 'esimgo',
                        'is_active' => 1,
                    ];

                    if ($esimPackage->exists) {
                        if (updateIfChanged($esimPackage, $pkgAttrs)) {
                            $this->info("✅ Updated package: {$esimPackage->name}");
                        }
                    } else {
                        $esimPackage->fill($pkgAttrs)->save();
                        $this->info("🆕 Created package: {$esimPackage->name}");
                    }

                    // Handle country & region mapping
                    $countryIds = [];
                    $regionId = 0;

                    foreach ($countries as $cntry) {
                        $countryName = $cntry->name ?? null;
                        $regionName = $cntry->region ?? null;

                        if ($countryName) {
                            $countryId = Country::where('name', $countryName)->value('id');
                            if ($countryId) {
                                $countryIds[] = $countryId;
                            }
                        }

                        if ($regionName) {
                            $regionId = Region::where('name', $regionName)->value('id') ?? $regionId;
                        }
                    }

                    updateIfChanged($esimPackage, [
                        'country_ids' => json_encode($countryIds),
                        'region_id' => $regionId,
                    ]);

                    $count++;
                }

                $page++;
            } while (!empty($response->bundles));

            $this->info("✅ eSIMgo package sync complete. Total synced: {$count}");

        } catch (\Throwable $e) {
            $this->error('❌ Error syncing eSIMgo packages: ' . $e->getMessage());
            return Command::FAILURE;
        }

        return Command::SUCCESS;
    }
}
