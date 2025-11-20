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
                        <input type="hidden" name="filter_location" value="{{ request()->filter_location ?? 'country' }}">
                        <div class="col-md-2">
                            <label for="">Currency</label>
                            <select name="currency_id" class="select2 form-control">
                                @foreach($currencies as $curr)
                                <option value="{{ $curr->id }}" {{ $curr->id == $currencyId ? 'selected' : '' }}>
                                    {{ $curr->name }} ({{ $curr->symbol }})
                                </option>
                                @endforeach
                            </select>
                        </div>
                        <div class="col-md-4">
                            <label for="">{{ $title }}</label>
                            <select name="location_id" class="select2 form-control">
                                <option value="all">All</option>
                                @foreach($locations as $location)
                                <option value="{{ $location->id }}" {{$location->id == request()->location_id  ? 'selected':''}}>
                                    {{ $location->name }}
                                </option>
                                @endforeach
                            </select>
                        </div>
                        <div class="col-md-4">
                            <input type="hidden" id="start_date" name="start_date">
                            <input type="hidden" id="end_date" name="end_date">
                            <div id="reportrange" style="background: #fff; cursor: pointer; padding: 5px 10px; border: 1px solid #ccc; width: 100%;margin-top: 18px;">
                                <i class="fa fa-calendar"></i>&nbsp;
                                <span></span> <i class="fa fa-caret-down"></i>
                            </div>
                        </div>

                        <div class="col-md-2 d-flex align-items-end gap-2">
                            <button class="btn btn-primary">Filter</button>
                            <a href="{{ route('admin.report.sale.export', request()->all()) }}" class="btn btn-success mt-3">
                                Export
                            </a>
                        </div>
                    </div>
                </form>

                {{-- ✅ Compact Summary Boxes --}}
                @php
                $totalProvider = collect($report)->sum('provider_price');
                $totalSale = collect($report)->sum('sale_price');
                $totalRevenue = $totalSale - $totalProvider;
                @endphp

                <div class="row mb-4">
                    <div class="col-md-4">
                        <div class="card shadow-sm text-white" style="background-color:#17a2b8;">
                            <div class="card-body d-flex flex-column justify-content-center align-items-center p-3">
                                <h6 class="mb-1 text-uppercase small">Total Provider Price</h6>
                                <h4 class="mb-0">{{ $totalProvider }}</h4>
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
                                <h4 class="mb-0">{{ $totalRevenue }}</h4>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="table-responsive">
                    <table id="basic-datatables" class="display table table-striped table-hover">
                        <thead>
                            <tr>
                                <th>SN#</th>
                                <th>Country/Region</th>
                                <th>Currency</th>
                                <th>Total Order</th>
                                <th>Provider Price</th>
                                <th>Sale Price</th>

                            </tr>
                        </thead>
                        <tbody>
                            @foreach($report as $row)
                            @if($row['orders'] > 0)
                            <tr>
                                <td>{{ $row['sn'] }}</td>
                                <td>
                                    <div style="display: flex; align-items: center; gap: 10px;">
                                        <img src="{{ asset($row['location_image'] ?? '') }}"
                                            alt="Flag"
                                            style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
                                        <span>{{ $row['location_name'] }}</span>
                                    </div>
                                </td>
                                <td>{{$row['currency']}}</td>
                                <td>{{ $row['orders'] }}</td>
                                <td>{{ $row['provider_price'] }}</td>
                                <td>{{ $row['sale_price'] }}</td>
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
