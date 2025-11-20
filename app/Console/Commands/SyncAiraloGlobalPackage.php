<?php

namespace App\Console\Commands;

use App\Jobs\CreateInAppProductJob;
use App\Models\Country;
use App\Models\EsimPackage;
use App\Models\Operator;
use App\Models\Region;
use App\Services\AiraloService;
use Illuminate\Console\Command;

class SyncAiraloGlobalPackage extends Command
{
    protected $signature = 'airalo:sync-global-package';
    protected $description = 'Sync Airalo Global eSIM packages with local database';

    public function handle()
    {
        $this->info('Syncing Airalo Global packages...');

        try {
            $airaloService = new AiraloService();
            $count = 0;
            $page = 1;

            // 🔑 Track all Airalo API IDs
            $airaloRegionSlugs = [];
            $airaloOperatorIds = [];
            $airaloPackageIds = [];

            do {
                $this->info("Fetching page $page...");
                $response = $airaloService->getPackages([
                    'page' => $page,
                    'type' => 'global',
                    'include' => 'topup',
                ]);

                if (empty($response['data'])) {
                    break;
                }

                foreach ($response['data'] as $data) {
                    $airaloRegionSlugs[] = $data['slug'];
                   $region = Region::firstOrNew(['name' => $data['title']]);
                    $regionAttrs = [
                        'slug' => $data['slug'],
                        'name' => $data['title'],
                        'image' => $data['image']['url'] ?? null,
                        'is_active' => 1
                    ];
                    if ($region->exists) {
                        if (updateIfChanged($region, $regionAttrs)) {
                            $this->info("Updated region: {$region->name}");
                        }
                    } else {
                        $region->fill($regionAttrs)->save();
                        $this->info("Created region: {$region->name}");
                    }

                    foreach ($data['operators'] as $operator) {
                        $generatedOperator = Operator::firstOrNew(['airaloOperatorId' => $operator['id']]);
                        $operatorAttrs = [
                            'airaloOperatorId' => $operator['id'],
                            'name' => $operator['title'],
                            'type' => $operator['type'],
                            'is_prepaid' => $operator['is_prepaid'],
                            'esim_type' => $operator['esim_type'],
                            'apn_type' => $operator['apn_type'],
                            'apn_value' => $operator['apn_value'],
                            'info' => implode("\n", $operator['info']),
                            'image' => $operator['image']['url'] ?? null,
                            'plan_type' => $operator['plan_type'],
                            'activation_policy' => $operator['activation_policy'],
                            'rechargeability' => $operator['rechargeability'],
                            'is_active' => 1
                        ];
                        if ($generatedOperator->exists) {
                            if (updateIfChanged($generatedOperator, $operatorAttrs)) {
                                $this->info("Updated Global operator: {$generatedOperator->name}");
                            }
                        } else {
                            $generatedOperator->fill($operatorAttrs)->save();
                            $this->info("Created Global operator: {$generatedOperator->name}");
                        }

                        $airaloOperatorIds[] = $generatedOperator->id;

                         // 🗺️ Map countries
                        $countryIds = [];
                        foreach ($operator['countries'] as $country) {
                            $dbCountry = Country::where('country_code', $country['country_code'])->first();
                            if ($dbCountry) {
                                $dbCountry->region_id = $region->id;
                                $dbCountry->save();
                                $countryIds[] = $dbCountry->id;
                            }
                        }

                        foreach ($operator['packages'] as $pkg) {
                            if (empty($pkg['id'])) {
                                continue;
                            }

                            $esimPackageGenerated = EsimPackage::firstOrNew(['package_id' => $pkg['id']]);
                            $pkgAttrs = [
                                'package_id' => $pkg['id'],
                                'country_ids' => !empty($countryIds) ? json_encode($countryIds) : 0,
                                'region_id' => $region->id,
                                'name' => $pkg['title'],
                                'type' => $pkg['type'],
                                'price' => $pkg['price'],
                                'amount' => $pkg['amount'],
                                'day' => $pkg['day'],
                                'is_unlimited' => $pkg['is_unlimited'],
                                'short_info' => $pkg['short_info'],
                                'qr_installation' => $pkg['qr_installation'],
                                'manual_installation' => $pkg['manual_installation'],
                                'is_fair_usage_policy' => $pkg['is_fair_usage_policy'],
                                'fair_usage_policy' => $pkg['fair_usage_policy'],
                                'data' => $pkg['data'],
                                'net_price' => $pkg['net_price'],
                                'prices' => $pkg['prices'],
                                'esim_provider' => 'airalo',
                                'is_active' => 1
                            ];

                            if ($esimPackageGenerated->exists) {
                                if (updateIfChanged($esimPackageGenerated, $pkgAttrs)) {
                                    $this->info("Updated package: {$esimPackageGenerated->name}");
                                }
                            } else {
                                $esimPackageGenerated->fill($pkgAttrs)->save();
                                $this->info("Created package: {$esimPackageGenerated->name}");
                            }
                            Operator::where('id',$generatedOperator->id)->update(['esim_id' => $esimPackageGenerated->id]);
                            $airaloPackageIds[] = $esimPackageGenerated->id;
                            $count++;
                        }
                    }
                }
                $page++;
            } while (!empty($response['data']));

            Operator::where('type', 'global')->whereNotIn('id', $airaloOperatorIds)->update(['airalo_active' => 0]);
            EsimPackage::whereNotIn('id', $airaloPackageIds)->update(['airalo_active' => 0]);

            $this->info("Airalo Global package sync complete. Synced $count packages.");
        } catch (\Exception $e) {
            $this->error('Error syncing Airalo Global packages: ' . $e->getMessage());
            return 1;
        }

        return 0;
    }
}
