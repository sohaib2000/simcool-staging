<?php

namespace App\Http\Resources;

use App\Models\Country;
use App\Models\InAppProduct;
use App\Models\Region;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use App\Services\GooglePlayService;
use App\Services\IosService;
use PhpParser\Node\Expr\Cast\Double;

class PackageDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $currency = Auth::guard('api')->check() ? Auth::guard('api')->user()->currency->name : 'USD';
        $fromApp = $request->input('fromApp');

        $defaultCurrency = systemflag('iapDefaultCurrency') ?? 'USD';
        $packagePrice = packagePrice($this->id, $currency);
        $netPrice = $packagePrice['totalAmount'] ?? 0;

        if (in_array($fromApp, ['ios', 'android'])) {
            $iapPrice = packagePrice($this->id, $defaultCurrency)['totalAmount'] ?? 0;
            $iapProduct = InAppProduct::where('min_price', '<=', $iapPrice)
                ->where('max_price', '>=', $iapPrice)
                ->first();

            if ($iapProduct) {
                if ($currency === $defaultCurrency) {
                    $netPrice = $fromApp === 'ios' ? $iapProduct->set_price : $iapProduct->max_price;
                } else {
                    $sku = $iapProduct->sku;
                    $cacheKey = "iap_price_{$fromApp}_{$sku}_{$currency}";

                    // Cache API prices for 10 minutes
                    $netPrice = Cache::remember($cacheKey, 600, function () use ($fromApp, $sku, $currency) {
                        if ($fromApp === 'ios') {
                            return (new IosService($sku, 'USA'))->priceGet();
                        } elseif ($fromApp === 'android') {
                            return (new GooglePlayService($sku, $currency))->priceGet();
                        }
                        return 0;
                    });
                }
            }
        }

         $countryIds = [];
        if (!empty($this->country_ids) && is_string($this->country_ids)) {
            $decode = json_decode($this->country_ids, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decode)) {
                $countryIds = $decode;
            }
        }

        // ---------------------------------
        // COUNTRIES FETCH + SLUG FILTER
        // ---------------------------------
        $countryQuery = Country::select('id', 'name', 'slug', 'country_code', 'image')
            ->whereIn('id', $countryIds);

        // /packages?country=1
        if ($request->filled('country')) {
            $countryQuery->where('id', $request->country);
        }

        // packages?slug=india  (only if slug exists in countries)
        if ($request->filled('slug')) {
            $slugExistsInCountry = Country::where('slug', $request->slug)->exists();

            if ($slugExistsInCountry) {
                $countryQuery->where('slug', $request->slug);
            }
        }

        $countries = $countryQuery->get();


        // ---------------------------------
        // REGION FETCH (SAFE)
        // ---------------------------------
       $regQuery = Region::select('id', 'name', 'slug', 'image', 'code')->where('id', $this->region_id);
        if($request->filled('slug')){
            $regQuery->orWhere('slug', $request->slug);
        }
        $region = $regQuery->get();

        return [
            "id" => $this->id,
            "package_id" => $this->package_id,
            "name" => $this->name,
            "operator" => $this->operator,
            "type" => $this->type,
            "day" => $this->day,
            "is_unlimited" => (bool) $this->is_unlimited,
            "short_info" => $this->short_info,
            "net_price" => $netPrice,
            "data" => $this->data,
            "price" => $this->price,
            "is_active" => (bool) $this->is_active,
            "created_at" => $this->created_at,
            "updated_at" => $this->updated_at,
            "is_fair_usage_policy" => (bool) $this->is_fair_usage_policy,
            "fair_usage_policy" => $this->fair_usage_policy,
            "qr_installation" => $this->qr_installation,
            "manual_installation" => $this->manual_installation,
            "country" => $countries,
            'region' => $region
        ];
    }
}
