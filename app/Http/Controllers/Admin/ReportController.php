<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Country;
use App\Models\Currency;
use App\Models\EsimOrder;
use App\Models\Region;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\SaleReportExport;
use App\Models\EsimPackage;

class ReportController extends Controller
{
    public function sale(Request $request)
    {
        try {
            $currencyId = $request->currency_id ?? 16;
            $locationId = $request->location_id ?? 'all';
            $filterType = $request->filter_location ?? 'country';
            $fromDate = $request->start_date ?? '';
            $toDate = $request->end_date ?? '';
            $currency   = Currency::find($currencyId);

            [$sales, $report, $title] = $this->generateSaleReport($currencyId, $locationId, $filterType, $currency, $fromDate, $toDate);

            $currencies = Currency::select('id', 'name', 'symbol')->get();
            if ($filterType == 'country') {
                $locations = Country::where('is_active', true)->get();
            } else {
                $locations = Region::where('is_active', true)->get();
            }
            return view('admin.reports.sale', compact('sales', 'currencies', 'report', 'currencyId', 'title', 'locationId', 'locations'));
        } catch (\Exception $th) {
            return back()->with('error', $th->getMessage());
        }
    }

    public function exportSaleReport(Request $request)
    {
        $currencyId = $request->currency_id ?? 16;
        $locationId = $request->location_id ?? 'all';
        $filterType = $request->filter_location ?? 'country';
        $fromDate = $request->start_date ?? '';
        $toDate = $request->end_date ?? '';
        $currency   = Currency::find($currencyId);

        [, $report,] = $this->generateSaleReport($currencyId, $locationId, $filterType, $currency, $fromDate, $toDate);

        $data = collect($report)->map(function ($row) {
            return [
                'SN'           => $row['sn'],
                'Location'     => $row['location']->name ?? '',
                'Currency'     => $row['currency'],
                'Total Order'  => $row['orders'],
                'Airalo Price' => $row['airalo'],
                'Sale Price'   => $row['sale'],
                'Revenue'      => $row['sale'] - $row['airalo'],
            ];
        });

        return Excel::download(new SaleReportExport($data), now()->format('Y-m-d_H-i-s') . '_report.xlsx');
    }

    /**
     * ✅ Shared report-building logic
     */
    private function generateSaleReport($currencyId, $locationId, $filterType, $currency, $fromDate, $toDate)
    {
        if ($filterType === 'country') {
            $title = 'Country';
            $query = Country::query();
        } else {
            $title = 'Region';
            $query = Region::query();
        }

        // Filter by selected location
        if ($locationId !== 'all') {
            $query->where('id', $locationId);
        }

        $locations = $query->get();

        $report = $locations->map(function ($location, $index) use ($currencyId, $currency, $filterType, $fromDate, $toDate) {
            if ($filterType === 'country') {
                // Match packages where country_ids contains this country
                $packages = EsimPackage::whereRaw("FIND_IN_SET(?, country_ids)", [$location->id])->pluck('id');
            } else {
                $packages = EsimPackage::where('region_id', $location->id)->pluck('id');
            }

            $ordersQuery = EsimOrder::whereIn('esim_package_id', $packages)
                ->where('currency_id', $currencyId);

            if ($fromDate && $toDate) {
                $ordersQuery->whereBetween('created_at', [$fromDate, $toDate]);
            }

            $orders = $ordersQuery->get();

            return [
                'sn'             => $index + 1,
                'location_name'  => $location->name ?? '-',
                'location_image'  => $location->image ?? '',
                'orders'   => $orders->count(),
                'currency'       => $currency->name ?? '',
                'provider_price' => $orders->sum('provider_price'),
                'sale_price'     => $orders->sum('total_amount'),
            ];
        });

        return [$locations, $report, $title];
    }


    public function analytics(Request $request)
    {
        try {
            $currencies = Currency::all();
            $reportData = [];

            foreach ($currencies as $currency) {
                $currencyId = $currency->id;
                // helper to safely read totals from a grouped collection
                $sumFor = function ($grouped, string $key, string $field, $value) {
                    return optional($grouped->get($key, collect())->firstWhere($field, $value))->total ?? 0;
                };

                // ---- WEEK ----
                $weekRows = EsimOrder::where('currency_id', $currencyId)
                    ->where('created_at', '>=', Carbon::now()->subDays(6))
                    ->selectRaw('DATE(created_at) as date, status, SUM(total_amount) as total')
                    ->groupBy('date', 'status')
                    ->orderBy('date')
                    ->get();

                // normalize keys: lowercase + map "canceled" -> "cancelled"
                $weekBase = $weekRows->groupBy(function ($row) {
                    $k = strtolower($row->status);
                    return $k === 'canceled' ? 'cancelled' : $k;
                });

                $weekLabels = collect(range(0, 6))->map(fn($i) => Carbon::now()->subDays(6 - $i)->format('d M'));
                $weekDates  = collect(range(0, 6))->map(fn($i) => Carbon::now()->subDays(6 - $i)->toDateString());

                $weekSuccess   = $weekDates->map(fn($d) => $sumFor($weekBase, 'completed',  'date', $d) + $sumFor($weekBase, 'created', 'date', $d));
                $weekFailed    = $weekDates->map(fn($d) => $sumFor($weekBase, 'failed',     'date', $d));
                $weekCancelled = $weekDates->map(fn($d) => $sumFor($weekBase, 'cancelled',  'date', $d));

                $reportData[$currency->name]['week'] = [
                    'labels'    => $weekLabels,
                    'success'   => $weekSuccess,
                    'failed'    => $weekFailed,
                    'cancelled' => $weekCancelled,
                    'totals'    => [
                        'success'   => $weekSuccess->sum(),
                        'failed'    => $weekFailed->sum(),
                        'cancelled' => $weekCancelled->sum(),
                    ],
                ];

                // ---- MONTH ----
                $monthRows = EsimOrder::where('currency_id', $currencyId)
                    ->where('created_at', '>=', Carbon::now()->subDays(29))
                    ->selectRaw('DATE(created_at) as date, status, SUM(total_amount) as total')
                    ->groupBy('date', 'status')
                    ->orderBy('date')
                    ->get();

                $monthBase = $monthRows->groupBy(function ($row) {
                    $k = strtolower($row->status);
                    return $k === 'canceled' ? 'cancelled' : $k;
                });

                $monthLabels = collect(range(0, 29))->map(fn($i) => Carbon::now()->subDays(29 - $i)->format('d M'));
                $monthDates  = collect(range(0, 29))->map(fn($i) => Carbon::now()->subDays(29 - $i)->toDateString());

                $monthSuccess   = $monthDates->map(fn($d) => $sumFor($monthBase, 'completed',  'date', $d) + $sumFor($monthBase, 'created', 'date', $d));
                $monthFailed    = $monthDates->map(fn($d) => $sumFor($monthBase, 'failed',     'date', $d));
                $monthCancelled = $monthDates->map(fn($d) => $sumFor($monthBase, 'cancelled',  'date', $d));

                $reportData[$currency->name]['month'] = [
                    'labels'    => $monthLabels,
                    'success'   => $monthSuccess,
                    'failed'    => $monthFailed,
                    'cancelled' => $monthCancelled,
                    'totals'    => [
                        'success'   => $monthSuccess->sum(),
                        'failed'    => $monthFailed->sum(),
                        'cancelled' => $monthCancelled->sum(),
                    ],
                ];

                // ---- YEAR ----
                $yearRows = EsimOrder::where('currency_id', $currencyId)
                    ->whereYear('created_at', Carbon::now()->year)
                    ->selectRaw('MONTH(created_at) as month, status, SUM(total_amount) as total')
                    ->groupBy('month', 'status')
                    ->orderBy('month')
                    ->get();

                $yearBase = $yearRows->groupBy(function ($row) {
                    $k = strtolower($row->status);
                    return $k === 'canceled' ? 'cancelled' : $k;
                });

                $yearLabels = collect(range(1, 12))->map(fn($m) => Carbon::create()->month($m)->format('M'));

                $yearSuccess   = collect(range(1, 12))->map(fn($m) => $sumFor($yearBase, 'completed',  'month', $m) + $sumFor($yearBase, 'created', 'month', $m));
                $yearFailed    = collect(range(1, 12))->map(fn($m) => $sumFor($yearBase, 'failed',     'month', $m));
                $yearCancelled = collect(range(1, 12))->map(fn($m) => $sumFor($yearBase, 'cancelled',  'month', $m));

                $reportData[$currency->name]['year'] = [
                    'labels'    => $yearLabels,
                    'success'   => $yearSuccess,
                    'failed'    => $yearFailed,
                    'cancelled' => $yearCancelled,
                    'totals'    => [
                        'success'   => $yearSuccess->sum(),
                        'failed'    => $yearFailed->sum(),
                        'cancelled' => $yearCancelled->sum(),
                    ],
                ];

                // symbol
                $reportData[$currency->name]['symbol'] = $currency->symbol;
            }

            return view('admin.reports.analytics', compact('reportData', 'currencies'));
        } catch (\Exception $th) {
            return back()->with('error', $th->getMessage());
        }
    }


    public function PackageSaleReport(Request $request)
    {
        $currencyId = $request->currency_id ?? 16; // default USD
        $startDate  = $request->start_date ?? now()->startOfMonth()->toDateString();
        $endDate    = $request->end_date ?? now()->endOfMonth()->toDateString();

        $report = EsimPackage::whereHas('orders', function ($q) use ($currencyId, $startDate, $endDate) {
            $q->where('currency_id', $currencyId)
                ->where('status', 'completed')
                ->whereBetween('created_at', [$startDate, $endDate]);
        })
            ->withCount(['orders as total_orders' => function ($q) use ($currencyId, $startDate, $endDate) {
                $q->where('currency_id', $currencyId)
                    ->whereBetween('created_at', [$startDate, $endDate]);
            }])
            ->withSum(['orders as total_provider_price' => function ($q) use ($currencyId, $startDate, $endDate) {
                $q->where('currency_id', $currencyId)
                    ->whereBetween('created_at', [$startDate, $endDate]);
            }], 'provider_price')
            ->withSum(['orders as total_sale_price' => function ($q) use ($currencyId, $startDate, $endDate) {
                $q->where('currency_id', $currencyId)
                    ->whereBetween('created_at', [$startDate, $endDate]);
            }], 'total_amount')
            ->orderByDesc('total_orders')
            ->get();

        // Totals for summary cards
        $totalAiralo = $report->sum('total_provider_price');
        $totalSale   = $report->sum('total_sale_price');
        $totalProfit = $totalSale - $totalAiralo;

        return view('admin.reports.packages_report', [
            'report'      => $report,
            'currencyId'  => $currencyId,
            'currencies'  => \App\Models\Currency::all(),
            'startDate'   => $startDate,
            'endDate'     => $endDate,
            'totalAiralo' => $totalAiralo,
            'totalSale'   => $totalSale,
            'totalProfit' => $totalProfit,
        ]);
    }
}
