@extends('layouts.app')
@section('content')

<div class="row">
    <div class="col-md-12">
        <div class="card">
            <div class="card-header">
                <h4 class="card-title">User Details</h4>
            </div>
            <div class="card-body">
                <ul class="nav nav-tabs nav-line nav-color-secondary" id="line-tab" role="tablist">
                    <li class="nav-item">
                        <a class="nav-link active" id="line-home-tab" data-bs-toggle="pill" href="#line-home" role="tab" aria-controls="pills-home" aria-selected="true">Basic Details</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" id="line-orders-tab" data-bs-toggle="pill" href="#line-orders" role="tab" aria-controls="pills-orders" aria-selected="false">Orders List</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" id="line-topup-tab" data-bs-toggle="pill" href="#line-topup" role="tab" aria-controls="pills-topup" aria-selected="false">Total Esim List</a>
                    </li>
                </ul>
                <div class="tab-content mt-3 mb-3" id="line-tabContent">
                    {{-- Basic Details Tab Pane --}}
                    <div class="tab-pane fade show active" id="line-home" role="tabpanel" aria-labelledby="line-home-tab">
                        <div class="row">
                            <div class="col-md-4 text-center">
                                <img src="{{ $user->image ? asset($user->image) : asset('assets/defaultProfile.png') }}" alt="User Profile" class="img-fluid rounded-circle shadow-sm" style="width: 150px; height: 150px; object-fit: cover; border: 3px solid #6c757d;">
                                <h3 class="mt-3">{{ @$user->name ?? 'N/A' }}</h3>
                                <p class="text-muted">{{ @$user->email ?? 'N/A' }}</p>

                                <hr>

                            </div>
                            <div class="col-md-8">
                                <div class="row">
                                    <div class="col-sm-6 mb-3">
                                        <div class="card card-stats card-round">
                                            <div class="card-body">
                                                <div class="row">
                                                    <div class="col-5">
                                                        <div class="icon-big text-center icon-primary">
                                                            <i class="fas fa-wallet"></i>
                                                        </div>
                                                    </div>
                                                    <div class="col-7 d-flex align-items-center">
                                                        <div class="numbers">
                                                            <p class="card-category">Points</p>
                                                            <h4 class="card-title">{{ number_format(@$user->pointBalance->balance) ?? '0' }}</h4>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-sm-6 mb-3">
                                        <div class="card card-stats card-round">
                                            <div class="card-body">
                                                <div class="row">
                                                    <div class="col-5">
                                                        <div class="icon-big text-center icon-info">
                                                            <i class="fas fa-shopping-cart"></i>
                                                        </div>
                                                    </div>
                                                    <div class="col-7 d-flex align-items-center">
                                                        <div class="numbers">
                                                            <p class="card-category">Total Orders</p>
                                                            <h4 class="card-title">{{ @$user->esimOrders->count() ?? 0 }}</h4>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-sm-6 mb-3">
                                        <div class="card card-stats card-round">
                                            <div class="card-body">
                                                <div class="row">
                                                    <div class="col-5">
                                                        <div class="icon-big text-center icon-warning">
                                                            <i class="fas fa-cubes"></i>
                                                        </div>
                                                    </div>
                                                    <div class="col-7 d-flex align-items-center">
                                                        <div class="numbers">
                                                            <p class="card-category">Active Esim</p>
                                                            <h4 class="card-title">{{ $activeEsim }}</h4>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-sm-6 mb-3">
                                        <div class="card card-stats card-round">
                                            <div class="card-body">
                                                <div class="row">
                                                    <div class="col-5">
                                                        <div class="icon-big text-center icon-danger">
                                                            <i class="fas fa-cubes"></i>
                                                        </div>
                                                    </div>
                                                    <div class="col-7 d-flex align-items-center">
                                                        <div class="numbers">
                                                            <p class="card-category">In Active Esim</p>
                                                            <h4 class="card-title">{{ $inActiveEsim }}</h4>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <hr>
                                <div class="row mt-4">
                                    <div class="col-12">
                                        <div class="row">
                                            <div class="col-sm-6">
                                                <p><strong>Registered On:</strong> {{ @$user->created_at->format('M d, Y H:i A') ?? 'N/A' }}</p>
                                            </div>
                                            <div class="col-sm-6">
                                                <p><strong>Last Updated:</strong> {{ @$user->updated_at->format('M d, Y H:i A') ?? 'N/A' }}</p>
                                            </div>
                                            @if(@$user->deleted_at)
                                            <div class="col-sm-6">
                                                <p><strong>Deleted At:</strong> {{ @$user->deleted_at->format('M d, Y H:i A') ?? 'N/A' }}</p>
                                            </div>
                                            @endif
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {{-- Orders List Tab Pane --}}
                    <div class="tab-pane fade" id="line-orders" role="tabpanel" aria-labelledby="line-orders-tab">
                        <div class="table-responsive">
                            <table id="basic-datatables" class="table table-hover table-striped">
                                <thead>
                                    <tr>
                                        <th>SN#</th>
                                        <th>Order</th>
                                        <th>Package</th>
                                        <th>User</th>
                                        <th>Currency</th>
                                        <th>Provider Price</th>
                                        <th>Total Amount</th>
                                        <th>Status</th>
                                        <th>Created At</th>
                                        <th>Updated At</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach(@$user->esimOrders->sortByDesc('created_at') as $i => $order)
                                    <tr>
                                        <td>{{ $i + 1 }}</td>
                                        <td><a href="{{route('admin.orders.details',$order->id)}}">{{ $order->order_ref }}</a></td>
                                        <td>{{ $order->package->name }}</td>
                                        <td>{{ $order->user->name ?? $order->user->email }}</td>
                                        <td>{{ $order->currency->name ?? 'INR' }}</td>
                                        <td>{{ round($order->provider_price) }}</td>
                                        <td>{{ round($order->total_amount) }}</td>
                                        <td>
                                            @if($order->status == 'paid')
                                            <span class="badge badge-primary">Paid</span>
                                            @elseif($order->status == 'completed')
                                            <span class="badge badge-success">Completed</span>
                                            @elseif($order->status == 'failed')
                                            <span class="badge badge-danger">Failed</span>
                                            @else
                                            <span class="badge badge-danger">Failed</span>
                                            @endif
                                        </td>
                                        <td>{{ date('d M Y h:i A', strtotime($order->created_at)) }}</td>
                                        <td>{{ date('d M Y h:i A', strtotime($order->updated_at)) }}</td>
                                    </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {{-- Total Esim List Tab Pane --}}
                    <div class="tab-pane fade" id="line-topup" role="tabpanel" aria-labelledby="line-topup-tab">
                        <div class="table-responsive">
                            <table id="basic-datatables" class="table table-hover table-striped">
                                <thead>
                                    <tr>
                                        <th>SN#</th>
                                        <th>Package</th>
                                        <th>ICCID</th>
                                        <th>Activated At</th>
                                        <th>Expired At</th>
                                        <th>Finished At</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach(@$user->esims as $i => $sim)
                                    <tr>
                                        <td>{{$i+1}}</td>
                                        <td>{{@$sim->package->name}}</td>
                                        <td>{{$sim->iccid}}</td>
                                        <td>{{$sim->activated_at ? date('d M Y h:i A',strtotime($sim->activated_at)) : '---'}}</td>
                                        <td>{{$sim->expired_at ? date('d M Y h:i A',strtotime($sim->expired_at)) : '---'}}</td>
                                        <td>{{$sim->finished_at ? date('d M Y h:i A',strtotime($sim->finished_at)) : '---'}}</td>
                                         <td>
                                            @if($sim->status == 'FINISHED')
                                            <span class="badge badge-primary">FINISHED</span>
                                            @elseif($sim->status == 'ACTIVE')
                                            <span class="badge badge-success">ACTIVE</span>
                                            @elseif($sim->status == 'Refunded')
                                            <span class="badge badge-info">REFUNDED</span>
                                            @else
                                            <span class="badge badge-warning">{{$sim->status}}</span>
                                            @endif
                                        </td>
                                    </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
