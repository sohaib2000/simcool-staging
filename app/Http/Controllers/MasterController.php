<?php

namespace App\Http\Controllers;

use App\Jobs\BatchUpdateInAppProductsJob;
use App\Models\Banner;
use App\Models\Blog;
use App\Models\Country;
use App\Models\Currency;
use App\Models\EsimPackage;
use App\Models\Page;
use App\Models\Region;
use App\Services\AiraloService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use App\Models\InAppProduct;
use Illuminate\Http\Request;
use App\Services\GooglePlayService;
use App\Services\IosService;
use Illuminate\Support\Facades\Cache;

class MasterController extends BaseController
{
    public function currencies()
    {
        try {
            $currencies = Currency::where('is_active', 1)->select('id', 'name', 'symbol')->get();
            return $this->sendResponse($currencies, 'Currencies data fetched');
        } catch (\Exception $th) {
            return $this->sendError($th->getMessage());
        }
    }

    public function countries(Request $request)
    {
        try {
            $currency = Auth::guard('api')->check()
                ? Auth::guard('api')->user()->currency->name
                : 'USD';

            $esimProvider = systemflag('esimProvider');
            $fromApp = $request->fromApp;
            $isAppRequest = in_array($fromApp, ['android', 'ios']);
            $defaultCurrency = $isAppRequest ? (systemflag('iapDefaultCurrency') ?? 'USD') : 'USD';

            // Fetch all active countries
            $countries = Country::where('is_active', true)->get();
            $countryIds = $countries->pluck('id')->toArray();
            $minPackageIdsByCountry = [];
            $relevantPackages = EsimPackage::select('id', 'net_price', 'country_ids')
                ->where('esim_provider', $esimProvider)
                ->orderBy('net_price', 'asc')
                ->get();

            // Map the minimum package ID to each country in memory
            foreach ($relevantPackages as $package) {
                $packageCountryIds = json_decode($package->country_ids, true);

                if (!is_array($packageCountryIds)) {
                    continue;
                }

                foreach ($packageCountryIds as $countryId) {
                    // Ensure the country ID is valid and only store the first (minimum price) package ID
                    if (in_array($countryId, $countryIds) && !isset($minPackageIdsByCountry[$countryId])) {
                        $minPackageIdsByCountry[$countryId] = $package->id;
                    }
                }
            }

            // --- 3. Process Countries, Calculate Prices, and Filter ---
            $countries = $countries->map(function ($country) use (
                $minPackageIdsByCountry,
                $isAppRequest,
                $fromApp,
                $currency,
                $defaultCurrency
            ) {
                $country->start_price = null;
                $minPackageId = $minPackageIdsByCountry[$country->id] ?? null;

                if ($minPackageId) {
                    $getPrice = packagePrice($minPackageId, $currency);
                    $netPrice = $getPrice['totalAmount'] ?? 0;

                    if ($isAppRequest) {
                        $iapPrice = packagePrice($minPackageId, $defaultCurrency)['totalAmount'] ?? 0;

                        $iapProduct = InAppProduct::where('min_price', '<=', $iapPrice)
                            ->where('max_price', '>=', $iapPrice)
                            ->first();

                        if ($iapProduct) {
                            if ($currency === $defaultCurrency) {
                                $netPrice = $fromApp === 'ios' ? $iapProduct->set_price : $iapProduct->max_price;
                            } else {
                                $sku = $iapProduct->sku;
                                $cacheKey = "iap_price_{$fromApp}_{$sku}_{$currency}";

                                // Cache API prices for 10 minutes (600 seconds)
                                $netPrice = Cache::remember($cacheKey, 86400, function () use ($fromApp, $sku, $currency) {
                                    if ($fromApp === 'ios') {
                                        $territory = match ($currency) {
                                            'AUD' => 'AUS',
                                            'BRL' => 'BRA',
                                            'GBP' => 'GBR',
                                            'CAD' => 'CAN',
                                            'AED' => 'ARE',
                                            'EUR' => 'EUR',
                                            'INR' => 'IND',
                                            'IDR' => 'IDN',
                                            'ILS' => 'ISR',
                                            'JPY' => 'JPN',
                                            'KWD' => 'KWT',
                                            'MYR' => 'MYS',
                                            'MXN' => 'MEX',
                                            'SGD' => 'SGP',
                                            'KRW' => 'KOR',
                                            'VND' => 'VNM',
                                            default => 'USA',
                                        };
                                        // External API call to get iOS price
                                        return (new IosService($sku, $territory))->priceGet();
                                    } elseif ($fromApp === 'android') {
                                        // External API call to get Google Play price
                                        return (new GooglePlayService($sku, $currency))->priceGet();
                                    }
                                    return 0;
                                });
                            }
                        }
                    }

                    $country->start_price = (float) $netPrice;
                }

                // Append image
                $country->image = $country->image ?? asset('assets/img/flags/' . strtolower($country->country_code) . '.png');

                return $country;
            })
                ->filter(function ($country) {
                    return $country->start_price !== null;
                })
                ->values();

            // --- 4. Return Response ---
            return $this->sendResponse($countries, 'Country data fetched');
        } catch (\Throwable $th) {
            // Log the error for debugging
            \Log::error("Error fetching countries: " . $th->getMessage());
            return $this->sendError($th->getMessage());
        }
    }


    public function regions(Request $request)
    {
        try {
            // --- 1. Initial Setup and Pre-fetching ---
            $currency = Auth::guard('api')->check()
                ? Auth::guard('api')->user()->currency->name
                : 'USD';

            $esimProvider = systemflag('esimProvider');
            $fromApp = $request->fromApp;
            $isAppRequest = in_array($fromApp, ['android', 'ios']);
            $defaultCurrency = $isAppRequest ? (systemflag('iapDefaultCurrency') ?? 'USD') : 'USD';

            // Fetch all active regions
            $regions = Region::where('is_active', true)
                ->orderBy('id', 'desc')
                ->get();

            // Collect all region IDs for a single query later
            $regionIds = $regions->pluck('id')->toArray();
            $minPackagesData = EsimPackage::select('id', 'region_id', 'net_price')
                ->whereIn('region_id', $regionIds)
                ->where('esim_provider', $esimProvider)
                ->orderBy('net_price', 'asc') // Sort packages within each region by net_price
                ->get()
                ->groupBy('region_id') // Group by region
                ->mapWithKeys(function ($packages, $regionId) {
                    $minPackage = $packages->first();
                    return [$regionId => $minPackage];
                });

            // --- 3. Process Regions and Calculate Prices ---
            $regions = $regions->map(function ($region) use (
                $minPackagesData,
                $isAppRequest,
                $fromApp,
                $currency,
                $defaultCurrency
            ) {
                $region->start_price = null;
                $minPackage = $minPackagesData[$region->id] ?? null;

                if ($minPackage) {
                    $getPrice = packagePrice($minPackage->id, $currency);
                    $netPrice = $getPrice['totalAmount'] ?? 0;

                    if ($isAppRequest) {
                        // Calculate IAP price in default currency
                        $iapPrice = packagePrice($minPackage->id, $defaultCurrency)['totalAmount'] ?? 0;

                        $iapProduct = InAppProduct::where('min_price', '<=', $iapPrice)
                            ->where('max_price', '>=', $iapPrice)
                            ->first();

                        if ($iapProduct) {
                            if ($currency === $defaultCurrency) {
                                $netPrice = $fromApp === 'ios' ? $iapProduct->set_price : $iapProduct->max_price;
                            } else {
                                $sku = $iapProduct->sku;
                                $cacheKey = "iap_price_{$fromApp}_{$sku}_{$currency}";
                                $netPrice = Cache::remember($cacheKey, 86400, function () use ($fromApp, $sku, $currency) {
                                    if ($fromApp === 'ios') {
                                        $territory = match ($currency) {
                                            'AUD' => 'AUS',
                                            'BRL' => 'BRA',
                                            'GBP' => 'GBR',
                                            'CAD' => 'CAN',
                                            'AED' => 'ARE',
                                            'EUR' => 'EUR',
                                            'INR' => 'IND',
                                            'IDR' => 'IDN',
                                            'ILS' => 'ISR',
                                            'JPY' => 'JPN',
                                            'KWD' => 'KWT',
                                            'MYR' => 'MYS',
                                            'MXN' => 'MEX',
                                            'SGD' => 'SGP',
                                            'KRW' => 'KOR',
                                            'VND' => 'VNM',
                                            default => 'USA',
                                        };
                                        return (new IosService($sku, $territory))->priceGet();
                                    } elseif ($fromApp === 'android') {
                                        return (new GooglePlayService($sku, $currency))->priceGet();
                                    }
                                    return 0;
                                });
                            }
                        }
                    }

                    if ($minPackage) {
                        $region->start_price = (float) $netPrice;
                    } else {
                        $region->start_price = null;
                    }
                }

                // Append image
                $region->image = $region->image ?? asset('assets/img/flags/' . $region->slug . '.png');

                return $region;
            });
            $regions = $regions->filter(function ($region) {
                return $region->start_price !== null;
            });

            // --- 4. Return Response ---
            return $this->sendResponse($regions, 'Region data fetched');
        } catch (\Throwable $th) {
            // Log the error for debugging
            \Log::error("Error fetching regions: " . $th->getMessage());
            return $this->sendError($th->getMessage());
        }
    }

    public function pages()
    {
        try {
            $pages = Page::where('is_active', true)->get();
            return $this->sendResponse($pages, 'Pages data fetched successfully');
        } catch (\Exception $th) {
            return $this->sendError($th->getMessage());
        }
    }
    public function blogs()
    {
        try {
            $blogs = Blog::where('is_published', true)->get();
            return $this->sendResponse($blogs, 'Blogs Data fetched successfully');
        } catch (\Exception $th) {
            return $this->sendError($th->getMessage());
        }
    }
    public function banners()
    {
        try {
            $banners = Banner::where('is_active', true)->whereDate('banner_to', '>', Carbon::now())->get();
            return $this->sendResponse($banners, 'Data fetched successfully');
        } catch (\Exception $th) {
            return $this->sendError($th->getMessage());
        }
    }
    public function deviceCompatibleEsim(AiraloService $airalo)
    {
        try {
            $response = $airalo->deviceCompatible();
            return $this->sendResponse($response['data'], 'Data fetched successfully');
        } catch (\Exception $th) {
            return $this->sendError($th->getMessage());
        }
    }
    public function generalSettings()
    {
        try {
            $response = [
                'logo'    => systemflag('logo'),
                'favicon' => systemflag('favicon'),
                'DarkLogo' => systemflag('DarkLogo'),
                'webconfig' => [
                    'siteName'          => systemflag('appName'),
                    // Firebase
                    'firebaseApiKey'        => systemflag('firebaseApiKey'),
                    'firebaseAuthDomain'    => systemflag('firebaseAuthDomain'),
                    'firebaseProjectId'     => systemflag('firebaseProjectId'),
                    'firebaseStorageBucket' => systemflag('firebaseStorageBucket'),
                    'firebaseSenderId'      => systemflag('firebaseSenderId'),
                    'firebaseAppId'         => systemflag('firebaseAppId'),
                    'firebaseVapidKey'      => systemflag('firebaseVapidKey'),

                    // Other configs
                    'webBaseUrl'        => systemflag('webBaseUrl'),
                    'contactEmail'      => systemflag('contactEmail'),
                    'contactPhone'      => systemflag('contactPhone'),
                    'address'           => systemflag('address'),
                ],
            ];
            return $this->sendResponse($response, 'Data fetched successfully');
        } catch (\Exception $th) {
            return $this->sendError($th->getMessage());
        }
    }
}
