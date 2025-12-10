<?php

namespace App\Console\Commands;

use App\Models\Country;
use App\Models\EsimPackage;
use App\Models\Operator;
use App\Models\Region;
use App\Services\EsimAccessService;
use Illuminate\Console\Command;

class SyncEsimAccessRegionPackage extends Command
{
    protected $signature = 'esimaccess:sync-packages';
    protected $description = 'Sync Esim Access eSIM packages with local database';

    public function handle()
    {
        $this->info('Syncing Esim Access packages...');

        try {
            $esimAccessService = new EsimAccessService();
            $count = 0;

            $response = $esimAccessService->getPackages([
                'locationCode' => '!RG'
            ]);

            foreach ($response->packageList as $pkg) {
                $esimPackageGenerated = EsimPackage::firstOrNew([
                    'package_id' => $pkg->packageCode
                ]);

                $bytes = $pkg->volume;
                $gb = $bytes / (1024 ** 3);

                $pkgAttrs = [
                    'package_id'         => $pkg->packageCode,
                    'name'               => $pkg->name,
                    'type'               => 'sim',
                    'price'              => $pkg->retailPrice / 10000,
                    'amount'             => $pkg->retailPrice,
                    'day'                => $pkg->duration,
                    'is_unlimited'       => $pkg->dataType == 4 ? 1 : 0,
                    'short_info'         => $pkg->description,
                    'fair_usage_policy'  => $pkg->fupPolicy,
                    'is_fair_usage_policy'  => !empty($pkg->fupPolicy) ? 1 : 0,
                    'data'               => $gb . ' GB',
                    'net_price'          => $pkg->price / 10000,
                    'location'           => $pkg->location,
                    'locationCode'       => $pkg->locationCode,
                    'esim_provider'      => 'esimaccess',
                    'prices'             => null,
                    'is_active'          => 1,
                ];

                if ($esimPackageGenerated->exists) {
                    if (updateIfChanged($esimPackageGenerated, $pkgAttrs)) {
                        $this->info("Updated package: {$esimPackageGenerated->name}");
                    }
                } else {
                    $esimPackageGenerated->fill($pkgAttrs)->save();
                    $this->info("Created package: {$esimPackageGenerated->name}");
                }

                $countryIds = [];
                foreach ($pkg->locationNetworkList as $location) {
                    $locationCode = $location->locationCode;
                    $countryId = Country::where('country_code', $locationCode)->value('id') ?? 0;
                    if($countryId > 0){
                        $countryIds[] = $countryId;
                    }
                    foreach ($location->operatorList as $operator) {
                        $generatedOperator = Operator::firstOrNew([
                            'name' => $operator->operatorName
                        ]);

                        $operatorAttrs = [
                            'esim_id' => $esimPackageGenerated->id,
                            'name'       => $operator->operatorName,
                            'type'       => 'local',
                            'is_prepaid' => 0,
                            'plan_type'  => 'data',
                            'networkType'  => $operator->networkType,
                            'is_active'  => 1,
                        ];

                        if ($generatedOperator->exists) {
                            if (updateIfChanged($generatedOperator, $operatorAttrs)) {
                                $this->info("Updated operator: {$generatedOperator->name}");
                            }
                        } else {
                            $generatedOperator->fill($operatorAttrs)->save();
                            $this->info("Created operator: {$generatedOperator->name}");
                        }
                    }
                }
                $regionId = Region::where('code', $pkg->locationCode)->value('id') ?? 0;
                updateIfChanged($esimPackageGenerated, ['country_ids' => json_encode($countryIds), 'region_id' => $regionId]);
                $count++;
            }

            $this->info("Esim Access package sync complete. Synced $count packages.");
        } catch (\Exception $e) {
            $this->error('Error syncing Esim Access packages: ' . $e->getMessage());
            return 1;
        }

        return 0;
    }
}
