<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\DeleteInAppProductJob;
use App\Jobs\StoreInAppProductDbJob;
use App\Models\Currency;
use App\Models\EsimPackage;
use App\Models\InAppProduct;
use Illuminate\Http\Request;

class InAppProductsController extends Controller
{
    public function index()
    {
        try {
            $currency = systemflag('iapDefaultCurrency');
            if (!$currency) {
                return back()->with('error', 'Please select default currency for IAP through general setting');
            }
            $currencyId = Currency::where('name', $currency)->pluck('id')->first();
            $products = InAppProduct::get();
            return view('admin.InAppProducts.index', compact('products', 'currencyId'));
        } catch (\Exception $th) {
            return back()->with('error', $th->getMessage());
        }
    }
    public function store(Request $request)
    {
        try {
            $request->validate([
                'currency'       => 'required|numeric',
                'price_range'    => 'required|numeric',
                'product_count'  => 'required|numeric',
            ]);
            $currency = $request->currency;
            $priceRange = $request->price_range;
            $productCount = $request->product_count;
            if($productCount > 999){
                return back()->with('error', 'you can not store more then 999 product');
            }
            $existProduct = InAppProduct::count();
            if($productCount + $existProduct > 999){
                return back()->with('error', 'you can not store more then 999 product');
            }
            StoreInAppProductDbJob::dispatch($currency, $priceRange, $productCount);
            return back()->with('success', 'Products started to store in database');
        } catch (\Exception $th) {
            return back()->with('error', $th->getMessage());
        }
    }
    public function deleteProduct()
    {
        try {
            EsimPackage::where('is_active', 1)
                ->chunk(100, function ($products) {
                    foreach ($products as $product) {
                        DeleteInAppProductJob::dispatch(
                            $product->package_id
                        );
                    }
                });
            return back()->with('success', 'Products delete started');
        } catch (\Exception $th) {
            return back()->with('error', $th->getMessage());
        }
    }
}
