<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\AppleStoreIapJob;
use App\Jobs\CreateInAppProductJob;
use App\Models\Country;
use App\Models\Currency;
use App\Models\EsimPackage;
use App\Models\InAppProduct;
use App\Models\Operator;
use App\Models\Region;
use App\Services\DynamicPriceImageGenerator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;

class MasterController extends Controller
{
    public function regions(Request $request)
    {
        try {
            $regions = Region::get();
            return view('admin.masters.region', compact('regions'));
        } catch (\Exception $th) {
            return back()->with('error', $th->getMessage());
        }
    }
    public function countries(Request $request)
    {
        try {
            $countries = Country::get();
            return view('admin.masters.countries', compact('countries'));
        } catch (\Exception $th) {
            return back()->with('error', $th->getMessage());
        }
    }
    public function operators(Request $request)
    {
        try {
            $operators = Operator::get();
            return view('admin.masters.operators', compact('operators'));
        } catch (\Exception $th) {
            return back()->with('error', $th->getMessage());
        }
    }
    public function packages(Request $request)
    {
        try {
            $limit = $request->input('limit', 15);

            $packages = EsimPackage::when($request->filled('location_id'), function ($query) use ($request) {
                $query->whereIn('country_ids', [$request->location_id])
                    ->orWhere('region_id', $request->location_id);
            })
                ->when($request->filled('package_id'), function ($query) use ($request) {
                    $query->where('id', $request->package_id);
                })
                ->when($request->filled('is_unlimited'), function ($query) use ($request) {
                    $query->where('is_unlimited', $request->is_unlimited);
                })
                ->when($request->filled('esim_provider'), function ($query) use ($request) {
                    $query->where('esim_provider', $request->esim_provider);
                })
                ->paginate($limit)
                ->appends($request->only([
                    'limit',
                    'location_id',
                    'package_id',
                    'is_unlimited',
                    'esim_provider'
                ]));

            $countries = Country::get();
            $regions = Region::get();

            // Merge countries and regions into one list for the dropdown
            $locations = $countries->merge($regions);

            $operators =  Operator::select('id', 'name')->get();
            $packageNames = EsimPackage::select('id', 'name')->orderBy('name')->get();

            return view('admin.masters.packages', compact(
                'packages',
                'limit',
                'locations',
                'operators',
                'packageNames'
            ));
        } catch (\Exception $th) {
            return back()->with('error', $th->getMessage());
        }
    }


    public function packageUpdate(Request $request)
    {
        try {
            $package = EsimPackage::findOrFail($request->id);
            $allowed = ['is_active', 'is_popular', 'is_recommend', 'is_best_value'];

            if (in_array($request->field, $allowed)) {
                $package->{$request->field} = $request->value;
                $package->save();

                return response()->json(['success' => true, 'message' => ucfirst(str_replace('_', ' ', $request->field)) . ' updated successfully.']);
            }
        } catch (\Exception $th) {
            return response()->json([
                'success' => false,
                'message' => $th->getMessage(),
            ]);
        }
    }
    public function getPackagesByAjax(Request $request)
    {
        try {
            $packages = EsimPackage::with('operator')
                ->when($request->country_id, function ($query) use ($request) {
                    $query->where('country_ids', [$request->country_id]);
                })
                ->when($request->region_id, function ($query) use ($request) {
                    $query->where('region_id', $request->region_id);
                })
                ->get();

            return response()->json($packages);
        } catch (\Exception $th) {
            return back()->with('error', $th->getMessage());
        }
    }
    public function currencies(Request $request)
    {
        try {
            $currencies = Currency::get();
            return view('admin.masters.currency', compact('currencies'));
        } catch (\Exception $th) {
            return back()->with('error', $th->getMessage());
        }
    }
    public function updateCurrencyEqual(Request $request, $id)
    {
        try {
            $currency = Currency::find($id);
            $currency->usd_conversion = $request->price;
            $currency->save();
            return redirect()->back()->with('success', 'Update successfully!');
        } catch (\Exception $th) {
            return back()->with('error', $th->getMessage());
        }
    }
    public function updatePoints(Request $request, $id)
    {
        try {
            $currency = Currency::find($id);
            $currency->referral_point = $request->points;
            $currency->save();
            return redirect()->back()->with('success', 'Update successfully!');
        } catch (\Exception $th) {
            return back()->with('error', $th->getMessage());
        }
    }

    public function syncFromAiralo()
    {
        try {
            Artisan::call('airalo:sync-packages');
            Artisan::call('airalo:sync-global-package');
            return redirect()->back()->with('success', 'Sync from Airalo Started Successfully!');
        } catch (\Exception $th) {
            return back()->with('error', $th->getMessage());
        }
    }
    public function syncFromEsimAccess()
    {
        try {
            Artisan::call('esimaccess:sync-packages');
            Artisan::call('esimaccess:sync-global-packages');
            return redirect()->back()->with('success', 'Sync from Esimaccess Started Successfully!');
        } catch (\Exception $th) {
            return back()->with('error', $th->getMessage());
        }
    }
    public function syncFromEsimGo()
    {
        try {
            Artisan::call('esimgo:sync-packages');
            return redirect()->back()->with('success', 'Sync from Esimaccess Started Successfully!');
        } catch (\Exception $th) {
            return back()->with('error', $th->getMessage());
        }
    }
    public function syncToGoogle()
    {
        try {
            InAppProduct::where('isActive', 1)->orderBy('id', 'desc')
                ->chunk(100, function ($products) {
                    foreach ($products as $product) {
                        $netPrice = $product->max_price;
                        $currency = $product->currency->name ?? 'USD';
                        // Dispatch job for each package
                        CreateInAppProductJob::dispatch(
                            $product->sku,
                            $product->name,
                            'eSIM Products',
                            $netPrice,
                            $currency
                        );
                    }
                });
            return redirect()->back()->with('success', 'Sync To Google Play Started Successfully!');
        } catch (\Exception $th) {
            return back()->with('error', $th->getMessage());
        }
    }
    public function syncToApple()
    {
        try {
            $defaultCurrency = systemflag('iapDefaultCurrency');
            $territory = match ($defaultCurrency) {
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
            InAppProduct::where('isActive', 1)->orderBy('id', 'desc')
                ->chunk(100, function ($products) use ($territory) {
                    foreach ($products as $product) {
                        $netPrice = $product->max_price;
                        $currency = $product->currency->name ?? 'USD';
                        // Dispatch job for each package
                        AppleStoreIapJob::dispatch(
                            $product->sku,
                            $product->name,
                            'eSIM Products',
                            $netPrice,
                            $currency,
                            $territory
                        );
                    }
                });
            return redirect()->back()->with('success', 'Sync To Apple Store Started Successfully!');
        } catch (\Exception $th) {
            return back()->with('error', $th->getMessage());
        }
    }
    public function iosReviewImageGenerate()
    {
        $templatePath = storage_path('app/templates/review_image.png');
        try {
            $products = InAppProduct::get();
            $iosReviewImage = new DynamicPriceImageGenerator();
            foreach ($products as $pro) {
                $name = $pro->name;
                $max = $pro->set_price;
                $reviewImage = $iosReviewImage->generatePriceImageWithGD($templatePath, $max, $name);
                $pro->ios_review_image = $reviewImage;
                $pro->save();
            }
            return "success";
        } catch (\Exception $e) {
            \Log::error("Image generation failed for : " . $e->getMessage());
            $reviewImage = null;
            return "Image generation failed for : " . $e->getMessage();
        }
    }
}
