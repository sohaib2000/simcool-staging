<?php

namespace App\Http\Controllers\Admin;

use App\Exports\OrdersExport;
use App\Http\Controllers\Controller;
use App\Models\EsimOrder;
use App\Models\TopupHistory;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = EsimOrder::query()->with([
                'user',
                'currency'
            ]);

            // Filter by order status
            if ($request->filled('status')) {
                $query->where('status', strtolower($request->status));
            }

            // Filter by date range
            if ($request->filled('from_date') && $request->filled('to_date')) {
                $query->whereBetween('created_at', [
                    $request->from_date . ' 00:00:00',
                    $request->to_date . ' 23:59:59',
                ]);
            }

            $orders = $query->latest()->paginate(20);

            return view('admin.orders.index', compact('orders'));
        } catch (\Exception $th) {
            return back()->with('error', $th->getMessage());
        }
    }

    public function details(Request $request, $id)
    {
        try {
            $order = EsimOrder::find($id);
            $topuphistory = TopupHistory::where('topup_package_id',$order->package->package_id)->first();
            return view('admin.orders.details', compact('order','topuphistory'));
        } catch (\Exception $th) {
            return back()->with('error', $th->getMessage());
        }
    }
    public function exportOrder(Request $request)
    {
        try {
            $filters = $request->only(['status', 'country', 'from_date', 'to_date']);
            return Excel::download(new OrdersExport($filters), now().'orders.xlsx');
        } catch (\Exception $th) {
            return back()->with('error', $th->getMessage());
        }
    }
}
