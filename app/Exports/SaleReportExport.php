<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class SaleReportExport implements FromCollection, WithHeadings
{
    protected $data;
    public function __construct(Collection $data)
    {
        $this->data = $data;
    }

    public function collection()
    {
        return $this->data;
    }

    public function headings(): array
    {
        return [
            "SN",
            "Location",
            "Currency",
            "Total Order",
            "Airalo Price",
            "Sale Price",
            "Revenue",
        ];
    }
}
