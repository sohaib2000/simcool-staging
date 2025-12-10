<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TopupHistory;
use App\Models\UserEsim;
use App\Services\AiraloService;
use Illuminate\Http\Request;

class EsimController extends Controller
{
    public function index(Request $request)
    {
        try {
            $search = $request->input('search');
            $limit  = $request->input('limit', 10);
            $esims = UserEsim::with(['package'])
                ->when($search, function ($query, $search) {
                    $query->where('iccid', 'like', "%{$search}%")
                        ->orWhere('status', 'like', "%{$search}%");
                })
                ->paginate($limit)
                ->appends([
                    'search' => $search,
                    'limit'  => $limit
                ]);
            return view('admin.orders.esims', compact('esims', 'search', 'limit'));
        } catch (\Exception $th) {
            return back()->with('error', $th->getMessage());
        }
    }

    public function getUsage(UserEsim $sim, AiraloService $airalo)
    {
        $usage = $airalo->getUsage($sim->iccid);

        return response()->json([
            'usage' => $usage['data'],
        ]);
    }
}
