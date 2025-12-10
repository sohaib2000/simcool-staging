<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Country;
use App\Models\Currency;
use App\Models\EsimOrder;
use App\Models\Kyc;
use App\Models\Payment;
use App\Models\User;
use App\Models\UserEsim;
use App\Models\UserNotification;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DashboardController extends Controller
{

    public function dashboard(Request $request)
    {
        // Example: Pass some data to the view
        $loggedInUser = Auth::user();
        $data = [];
        $totalUser = User::where('role', 'user')->count();
        $totalActiveEsim = UserEsim::where('status', 'ACTIVE')->count();
        $totalEsim = UserEsim::count();
        $totalSale = EsimOrder::whereIn('status', ['completed'])->sum('total_amount');
        $totalOrder = EsimOrder::count();
        $totalCompleteOrder = EsimOrder::where('status', 'completed')->count();
        $latestUsers = User::whereNot('role', 'admin')->latest()->take(6)->select('id', 'name', 'email', 'image', 'created_at')->orderBy('id', 'desc')->get();
        $transactions = Payment::with('user')->latest()->take(7)->where('payment_status', 'paid')->select('id', 'payment_id', 'user_id', 'updated_at', 'amount', 'payment_status', 'gateway', 'currency_id')->orderBy('id', 'desc')->get();
        $sales = Currency::withSum('order', 'total_amount')
            ->withSum('order', 'provider_price')
            ->get();
        $kycCounts = Kyc::select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');

        $pendingKyc  = $kycCounts['pending'] ?? 0;
        $approvedKyc = $kycCounts['approved'] ?? 0;
        $rejectedKyc = $kycCounts['rejected'] ?? 0;
        $orders = EsimOrder::all();

        // --- WEEK ---
        $weekLabels = [];
        for ($i = 6; $i >= 0; $i--) {
            $weekLabels[] = Carbon::now()->subDays($i)->format('d M');
        }
        $weekData = $this->countOrders($orders, $weekLabels, 'week');

        // --- MONTH ---
        $daysInMonth = Carbon::now()->daysInMonth;
        $monthLabels = range(1, $daysInMonth);
        $monthData = $this->countOrders($orders, $monthLabels, 'month');

        // --- YEAR ---
        $yearLabels = [];
        for ($i = 1; $i <= 12; $i++) {
            $yearLabels[] = Carbon::create()->month($i)->format('M');
        }
        $yearData = $this->countOrders($orders, $yearLabels, 'year');


        $filters = ['week', 'month', 'year'];
        $allData = [];

        foreach ($filters as $filter) {
            $query = EsimOrder::query()
                ->join('esim_packages', 'esim_orders.esim_package_id', '=', 'esim_packages.id');
            // ->leftJoin('countries', function ($join) {
            //     $join->on('countries.id', '=', 'operators.country_id')
            //         ->where('operators.type', '=', 'local');
            // })
            // ->leftJoin('regions', function ($join) {
            //     $join->on('regions.id', '=', 'operators.region_id')
            //         ->where('operators.type', '=', 'global');
            // });

            if ($filter === 'week') {
                $query->whereBetween('esim_orders.created_at', [
                    now()->subDays(6)->startOfDay(),
                    now()->endOfDay()
                ]);
            } elseif ($filter === 'month') {
                $query->whereYear('esim_orders.created_at', now()->year)
                    ->whereMonth('esim_orders.created_at', now()->month);
            } elseif ($filter === 'year') {
                $query->whereYear('esim_orders.created_at', now()->year);
            }

            $orders = $query->get();

            $countryCounts = [];
            foreach ($orders as $order) {
                $countriesCode = Country::whereIn('id', [$order->package->country_ids])->pluck('country_code')->toArray();
                foreach ($countriesCode as $code) {
                    $code = strtoupper($code);
                    $countryCounts[$code] = ($countryCounts[$code] ?? 0) + 1;
                }
                // if ($order->type === 'local' && $order->local_code) {
                //     $code = strtoupper($order->local_code);
                //     $countryCounts[$code] = ($countryCounts[$code] ?? 0) + 1;
                // } elseif ($order->type === 'global' && $order->region_id) {
                //     $regionCountries = DB::table('countries')
                //         ->where('region_id', $order->region_id)
                //         ->pluck('country_code')
                //         ->toArray();
                //     foreach ($regionCountries as $code) {
                //     }
                // }
            }

            $allData[$filter] = $countryCounts;
        }

        // Last 7 days (user registrations)
        $userLast7Days = User::whereNot('role', 'admin')->selectRaw('DATE(created_at) as date, COUNT(*) as total')
            ->whereBetween('created_at', [now()->subDays(6)->startOfDay(), now()->endOfDay()])
            ->groupBy('date')
            ->pluck('total', 'date')
            ->toArray();

        $userWeekLabels = [];
        $userWeekData = [];
        foreach (range(0, 6) as $i) {
            $day = now()->subDays(6 - $i)->toDateString();
            $userWeekLabels[] = now()->subDays(6 - $i)->format('d M');
            $userWeekData[] = $userLast7Days[$day] ?? 0;
        }

        // Monthly (current month)
        $userMonthly = User::whereNot('role', 'admin')->selectRaw('DAY(created_at) as day, COUNT(*) as total')
            ->whereYear('created_at', now()->year)
            ->whereMonth('created_at', now()->month)
            ->groupBy('day')
            ->pluck('total', 'day')
            ->toArray();

        $userMonthLabels = [];
        $userMonthData = [];
        for ($d = 1; $d <= now()->daysInMonth; $d++) {
            $userMonthLabels[] = $d;
            $userMonthData[] = $userMonthly[$d] ?? 0;
        }

        // Yearly (current year)
        $userYearly = User::whereNot('role', 'admin')->selectRaw('MONTH(created_at) as month, COUNT(*) as total')
            ->whereYear('created_at', now()->year)
            ->groupBy('month')
            ->pluck('total', 'month')
            ->toArray();

        $userYearLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        $userYearData = [];
        for ($m = 1; $m <= 12; $m++) {
            $userYearData[] = $userYearly[$m] ?? 0;
        }


        $data['totalUser'] = $totalUser;
        $data['totalActiveEsim'] = $totalActiveEsim;
        $data['totalSale'] = $totalSale;
        $data['totalOrder'] = $totalOrder;
        $data['totalEsim'] = $totalEsim;
        $data['totalCompleteOrder'] = $totalCompleteOrder;
        $data['latestUsers'] = $latestUsers;
        $data['transactions'] = $transactions;
        $data['sales'] = $sales;
        $data['pendingKyc'] = $pendingKyc;
        $data['approvedKyc'] = $approvedKyc;
        $data['rejectedKyc'] = $rejectedKyc;
        $data['weekLabels'] = $weekLabels;
        $data['monthLabels'] = $monthLabels;
        $data['yearLabels'] = $yearLabels;
        $data['weekData'] = $weekData;
        $data['monthData'] = $monthData;
        $data['yearData'] = $yearData;
        return view('admin.dashboard', $data, [
            'mapData' => $allData,
            'userFilterWeek'  => ['labels' => $userWeekLabels,  'data' => $userWeekData],
            'userFilterMonth' => ['labels' => $userMonthLabels, 'data' => $userMonthData],
            'userFilterYear'  => ['labels' => $userYearLabels,  'data' => $userYearData],
        ], compact('loggedInUser'));
    }

    /**
     * Show the user's profile.
     *
     * @return \Illuminate\View\View
     */

    private function countOrders($orders, $labels, $type)
    {
        $completed = array_fill(0, count($labels), 0);
        $paid = array_fill(0, count($labels), 0);
        $cancelled = array_fill(0, count($labels), 0);
        $failed = array_fill(0, count($labels), 0);

        foreach ($orders as $order) {
            $date = Carbon::parse($order->created_at);

            if ($type === 'week') {
                $label = $date->format('d M');
            } elseif ($type === 'month') {
                $label = (int)$date->format('j');
            } else {
                $label = $date->format('M');
            }

            $index = array_search($label, $labels);
            if ($index !== false) {
                if ($order->status === 'completed') $completed[$index]++;
                if ($order->status === 'paid') $paid[$index]++;
                if ($order->status === 'cancelled') $cancelled[$index]++;
                if ($order->status === 'failed') $failed[$index]++;
            }
        }

        return [
            'completed' => $completed,
            'paid' => $paid,
            'cancelled' => $cancelled,
            'failed' => $failed
        ];
    }
    public function profile(Request $request)
    {
        if ($request->isMethod('POST')) {
            $user = Auth::user();
            $user = User::find($user->id);

            $request->validate([
                'name'   => 'required|string|max:255',
                'email'  => 'required|email|unique:users,email,' . $user->id,
                'password' => 'nullable|confirmed|min:6',
                'image'  => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            ]);

            $user->name  = $request->name;
            $user->email = $request->email;

            if ($request->filled('password')) {
                $user->password = Hash::make($request->password);
            }

            if ($request->hasFile('image')) {
                $path = $request->file('image')->store('uploads/profile', 'public');
                $user->image = 'storage/' . $path;
            }

            $user->save();

            return back()->with('success', 'Profile updated successfully!');
        }
        return view('admin.profile');
    }
}
