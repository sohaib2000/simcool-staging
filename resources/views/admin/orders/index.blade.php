@extends('layouts.app')
@section('content')

<div class="row">
    <div class="col-md-12">
        <div class="card">
            <div class="card-header">
                <div class="row">
                    <div class="col-md-6">
                        <h4 class="card-title">Order List</h4>
                    </div>
                </div>
            </div>
            <div class="card-body">
                <form method="GET" action="{{ route('admin.orders') }}" class="mb-4">
                    <div class="row">
                        <div class="col-md-2">
                            <select name="status" class="form-control">
                                <option value="">-- Select Status --</option>
                                <option value="Completed" {{ request('status') == 'Completed' ? 'selected' : '' }}>Completed</option>
                                <option value="failed" {{ request('status') == 'failed' ? 'selected' : '' }}>Failed</option>
                                <option value="cancelled" {{ request('status') == 'cancelled' ? 'selected' : '' }}>Cancelled</option>
                            </select>
                        </div>

                        <div class="col-md-2">
                            <input type="text" name="country" class="form-control" placeholder="Country/Region"
                                value="{{ request('country') }}">
                        </div>

                        <div class="col-md-2">
                            <input type="date" name="from_date" class="form-control" value="{{ request('from_date') }}">
                        </div>

                        <div class="col-md-2">
                            <input type="date" name="to_date" class="form-control" value="{{ request('to_date') }}">
                        </div>

                        <div class="col-md-4">
                            <button type="submit" class="btn btn-primary mr-2">
                                <i class="fas fa-filter"></i> Filter
                            </button>
                            <a href="{{ route('admin.orders') }}" class="btn btn-secondary ml-1">
                                <i class="fas fa-redo-alt"></i> Reset
                            </a>
                            <a href="{{ route('admin.orders.export', request()->query()) }}" class="btn btn-success">
                                <i class="fas fa-file-excel"></i> Export
                            </a>
                        </div>
                    </div>
                </form>

                <div class="table-responsive">
                    <table class="display table table-striped table-hover">
                        <thead>
                            <tr>
                                <th>SN#</th>
                                <th>Order</th>
                                <th>Package</th>
                                <th>Type</th>
                                <th>User</th>
                                <th>Currency</th>
                                <th>Provider Price</th>
                                <th>Total Amount</th>
                                <th>Esim Provider</th>
                                <th>Status</th>
                                <th>Created At</th>
                                <th>Updated At</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($orders as $i => $order)
                            <tr>
                                <td>{{ $i + 1 }}</td>
                                <td><a href="{{route('admin.orders.details',$order->id)}}">{{ $order->order_ref }}</a></td>
                                <td>{{ $order->package->name }}</td>
                                <td>{{ $order->package->type}}</td>
                                <td>{{ @$order->user->name ? @$order->user->name : (@$order->user->email ? @$order->user->email : '----')}}</td>
                                <td>{{ $order->currency->name ?? 'INR' }}</td>
                                <td>{{ round($order->provider_price) }}</td>
                                <td>{{ round($order->total_amount) }}</td>
                                <td>{{ ucfirst($order->package->esim_provider) }}</td>
                                <td>
                                    @if($order->status == 'paid')
                                    <span class="badge badge-primary">Paid</span>
                                    @elseif($order->status == 'completed')
                                    <span class="badge badge-success">Completed</span>
                                    @elseif($order->status == 'failed')
                                    <span class="badge badge-danger">Failed</span>
                                    @elseif($order->status == 'cancelled')
                                    <span class="badge badge-danger">Cancelled</span>
                                    @else
                                    <span class="badge badge-danger">{{$order->status}}</span>
                                    @endif
                                </td>
                                <td>{{ date('d M Y h:i A', strtotime($order->created_at)) }}</td>
                                <td>{{ date('d M Y h:i A', strtotime($order->updated_at)) }}</td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
                <div class="flex justify-center mt-4 float-end">
                    {{ $orders->withQueryString()->links() }}
                </div>
            </div>
        </div>
    </div>
</div>

@endsection
