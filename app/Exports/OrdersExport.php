<?php

namespace App\Exports;

use App\Models\EsimOrder;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Illuminate\Support\Collection;

class OrdersExport implements FromCollection, WithHeadings
{
    protected $filters;

    public function __construct($filters)
    {
        $this->filters = $filters;
    }

    public function collection(): Collection
    {
        $query = EsimOrder::query()->with([
            'package.region',
            'user',
            'currency'
        ]);

        if (!empty($this->filters['status'])) {
            $query->where('status', $this->filters['status']);
        }

        // if (!empty($this->filters['country'])) {
        //     $query->whereHas('package.operator', function ($q) {
        //         $q->whereHas('country', function ($sub) {
        //             $sub->where('name', 'like', '%' . $this->filters['country'] . '%');
        //         })->orWhereHas('region', function ($sub) {
        //             $sub->where('name', 'like', '%' . $this->filters['country'] . '%');
        //         });
        //     });
        // }

        if (!empty($this->filters['from_date']) && !empty($this->filters['to_date'])) {
            $query->whereBetween('created_at', [
                $this->filters['from_date'] . ' 00:00:00',
                $this->filters['to_date'] . ' 23:59:59',
            ]);
        }

        $orders = $query->get();

        return $orders->map(function ($order) {
            return [
                'Order Ref' => $order->order_ref,
                'Status' => $order->status,
                'Country/Region' => $order->package->region->name ?? '-',
                'User' => $order->user->name ?? $order->user->email,
                'Currency' => $order->currency->name ?? 'INR',
                'Airalo Price' => round($order->provider_price),
                'Total Amount' => round($order->total_amount),
                'Created At' => $order->created_at->format('d M Y h:i A'),
                'Updated At' => $order->updated_at->format('d M Y h:i A'),
            ];
        });
    }

    public function headings(): array
    {
        return [
            'Order Ref',
            'Status',
            'Country/Region',
            'User',
            'Currency',
            'Airalo Price',
            'Total Amount',
            'Created At',
            'Updated At',
        ];
    }
}
