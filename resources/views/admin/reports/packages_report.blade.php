@extends('layouts.app')
@section('content')
<div class="row">
    <div class="col-md-12">
        <div class="card">
            <div class="card-header">
                <div class="row">
                    <div class="col-md-6">
                        <h4 class="card-title">Sale Report</h4>
                    </div>
                </div>
            </div>
            <div class="card-body">
                <form action="" method="get" class="mb-3">
                    <div class="row">
                        <div class="col-md-3">
                            <label for="">Currency</label>
                            <select name="currency_id" class="form-control">
                                @foreach($currencies as $curr)
                                <option value="{{ $curr->id }}" {{ $curr->id == $currencyId ? 'selected' : '' }}>
                                    {{ $curr->name }} ({{ $curr->symbol }})
                                </option>
                                @endforeach
                            </select>
                        </div>

                        <div class="col-md-6">
                            <input type="hidden" id="start_date" name="start_date" value="{{ $startDate }}">
                            <input type="hidden" id="end_date" name="end_date" value="{{ $endDate }}">
                            <div id="reportrange" style="background:#fff;cursor:pointer;padding:5px 10px;border:1px solid #ccc;width:100%;margin-top:18px;">
                                <i class="fa fa-calendar"></i>&nbsp;
                                <span></span> <i class="fa fa-caret-down"></i>
                            </div>
                        </div>

                        <div class="col-md-3 d-flex align-items-end gap-2">
                            <button class="btn btn-primary">Filter</button>

                        </div>
                    </div>
                </form>

                <div class="row mb-4">
                    <div class="col-md-4">
                        <div class="card shadow-sm text-white" style="background-color:#17a2b8;">
                            <div class="card-body d-flex flex-column justify-content-center align-items-center p-3">
                                <h6 class="mb-1 text-uppercase small">Total Airalo Price</h6>
                                <h4 class="mb-0">{{ $totalAiralo }}</h4>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card shadow-sm text-white" style="background-color:#28a745;">
                            <div class="card-body d-flex flex-column justify-content-center align-items-center p-3">
                                <h6 class="mb-1 text-uppercase small">Total Sale Price</h6>
                                <h4 class="mb-0">{{$totalSale }}</h4>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card shadow-sm text-dark" style="background-color:#ffc107;">
                            <div class="card-body d-flex flex-column justify-content-center align-items-center p-3">
                                <h6 class="mb-1 text-uppercase small">Total Profit</h6>
                                <h4 class="mb-0">{{ $totalProfit }}</h4>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="table-responsive">
                    <table id="basic-datatables" class="display table table-striped table-hover">
                        <thead>
                            <tr>
                                <th>SN#</th>
                                <th>Package Name</th>
                                <th>Total Orders</th>
                                <th>Airalo Price</th>
                                <th>Sale Price</th>
                                <th>Profit</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($report as $index => $row)
                            @if($row->total_orders > 0)
                            <tr>
                                <td>{{ $index+1 }}</td>
                                <td>{{ $row->name ?? 'N/A' }}</td>
                                <td>{{ $row->total_orders }}</td>
                                <td>{{ $row->total_airalo }}</td>
                                <td>{{ $row->total_sale }}</td>
                                <td>{{ $row->total_sale - $row->total_airalo }}</td>
                            </tr>
                            @endif
                            @endforeach
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    </div>
</div>

@endsection

@push('scripts')


@endpush
