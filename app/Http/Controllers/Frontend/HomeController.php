<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Country;
use App\Models\EsimPackage;
use App\Models\InAppProduct;
use App\Models\Flaggroup;
use App\Models\Systemflag;
use App\Models\Faq;
use App\Models\Page;
use App\Models\Region;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Mail\AllMail;
use Illuminate\Support\Facades\Mail;

class HomeController extends Controller
{
    public function home(Request $request)
    {
        try {
            $destinations = Country::whereHas('operators.esimPackages')
                ->with(['operators' => function ($q) {
                    $q->whereHas('esimPackages')
                        ->with('esimPackages');
                }])
                ->inRandomOrder()
                ->take(6)
                ->get();

            $esimPackages = EsimPackage::where('type', 'sim')
                ->whereHas('operator', function ($query) {
                    $query->where('plan_type', 'data-voice-text');
                })
                ->with('operator.country')
                ->inRandomOrder()
                ->take(3)
                ->get();
            $faqs = Faq::get();
            return view('frontend.index', compact('faqs', 'destinations', 'esimPackages'));
        } catch (\Exception $th) {
            return back()->with('error', $th->getMessage());
        }
    }

    public function search(Request $request)
    {
        $query = $request->get('q');

        $countries = Country::where('name', 'like', "%{$query}%")
            ->select('id', 'name', 'image', 'country_code', DB::raw("'Rountry' as type"))
            ->limit(5)
            ->get();

        $regions = Region::where('name', 'like', "%{$query}%")
            ->select('id', 'name', 'image', DB::raw("null as country_code"), DB::raw("'Region' as type"))
            ->limit(5)
            ->get();

        $results = $countries->merge($regions);

        return response()->json($results);
    }
}
