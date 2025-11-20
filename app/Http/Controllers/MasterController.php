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

            $countries = Country::where('is_active', true)
                ->get()
                ->map(function ($country) use ($esimProvider, $currency, $request) {
                    // Fetch the minimum package price for this country in one query
                    $minPackage = EsimPackage::where('esim_provider', $esimProvider)
                        ->whereJsonContains('country_ids', (int)$country->id)
                        ->orderBy('net_price', 'asc') // assuming you have a base price column
                        ->first(['id', 'net_price']);

                    if ($minPackage) {
                        $getPrice = packagePrice($minPackage->id, $currency);
                        $netPrice = $getPrice['totalAmount'] ?? 0;

                        if (in_array($request->fromApp, ['android', 'ios'])) {
                            $netPrice = InAppProduct::where('min_price', '<=', $netPrice)
                                ->where('max_price', '>=', $netPrice)
                                ->value('max_price') ?? $netPrice;
                        }

                        $country->start_price = (float) $netPrice;
                    } else {
                        $country->start_price = null;
                    }
                    return $country;
                });

            return $this->sendResponse($countries, 'Country data fetched');
        } catch (\Throwable $th) {
            return $this->sendError($th->getMessage());
        }
    }

   public function regions(Request $request)
{
    try {
        $currency = Auth::guard('api')->check()
            ? Auth::guard('api')->user()->currency->name
            : 'USD';

        $esimProvider = systemflag('esimProvider');

        $regions = Region::where('is_active', true)
            ->orderBy('id','desc')
            ->get()
            ->map(function ($region) use ($esimProvider, $currency, $request) {
                // Get the minimum package price directly by region_id
                $minPackage = EsimPackage::where('esim_provider', $esimProvider)
                    ->where('region_id', $region->id)
                    ->orderBy('net_price', 'asc')
                    ->first(['id', 'net_price']);

                if ($minPackage) {
                    $getPrice = packagePrice($minPackage->id, $currency);
                    $netPrice = $getPrice['totalAmount'] ?? 0;

                    if (in_array($request->fromApp, ['android', 'ios'])) {
                        $netPrice = InAppProduct::where('min_price', '<=', $netPrice)
                            ->where('max_price', '>=', $netPrice)
                            ->value('max_price') ?? $netPrice;
                    }

                    $region->start_price = (float) $netPrice;
                } else {
                    $region->start_price = null;
                }
                return $region;
            });

        return $this->sendResponse($regions, 'Region data fetched');
    } catch (\Throwable $th) {
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
