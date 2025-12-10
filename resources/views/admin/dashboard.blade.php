@extends('layouts.app')

@section('content')
<div class="d-flex align-items-left align-items-md-center flex-column flex-md-row pt-2 pb-4">
    <div>
        <h3 class="fw-bold mb-3">Dashboard</h3>
    </div>
</div>
<div class="row">
    <div class="col-sm-6 col-md-3">
        <a href="{{ route('admin.user.index') }}">
            <div class="card card-stats card-round" style="background-color:#4CAF50; color:#fff;">
                <div class="card-body">
                    <div class="row">
                        <div class="col-5">
                            <div class="icon-big text-center">
                                <i class="fas fa-users"></i>
                            </div>
                        </div>
                        <div class="col-7 col-stats">
                            <div class="numbers">
                                <p class="card-category text-white">Users</p>
                                <h4 class="card-title text-white">{{ number_format($totalUser) }}</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </a>
    </div>

    <div class="col-sm-6 col-md-3">
        <div class="card card-stats card-round" style="background-color:#2196F3; color:#fff;">
            <div class="card-body">
                <div class="row">
                    <div class="col-5">
                        <div class="icon-big text-center">
                            <i class="fas fa-money-check"></i>
                        </div>
                    </div>
                    <div class="col-7 col-stats">
                        <div class="numbers">
                            <p class="card-category text-white">Total Active ESIM</p>
                            <h4 class="card-title text-white">{{ number_format($totalActiveEsim) }}</h4>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="col-sm-6 col-md-3">
        <a href="{{ route('admin.orders') }}">
            <div class="card card-stats card-round" style="background-color:#FF9800; color:#fff;">
                <div class="card-body">
                    <div class="row">
                        <div class="col-5">
                            <div class="icon-big text-center">
                                <i class="fas fa-cubes"></i>
                            </div>
                        </div>
                        <div class="col-7 col-stats">
                            <div class="numbers">
                                <p class="card-category text-white">Complete Order</p>
                                <h4 class="card-title text-white">{{ number_format($totalCompleteOrder) }}</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </a>
    </div>

    <div class="col-sm-6 col-md-3">
        <a href="{{ route('admin.orders') }}">
            <div class="card card-stats card-round" style="background-color:#F44336; color:#fff;">
                <div class="card-body">
                    <div class="row">
                        <div class="col-5">
                            <div class="icon-big text-center">
                                <i class="fas fa-cubes"></i>
                            </div>
                        </div>
                        <div class="col-7 col-stats">
                            <div class="numbers">
                                <p class="card-category text-white">Failed Order</p>
                                <h4 class="card-title text-white">{{ number_format($totalOrder - $totalCompleteOrder) }}</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </a>
    </div>
</div>

<div class="row">
    <div class="col-sm-6 col-md-3">
        <a href="{{ route('admin.esims') }}">
            <div class="card card-stats card-round" style="background-color:#9C27B0; color:#fff;">
                <div class="card-body">
                    <div class="row">
                        <div class="col-5">
                            <div class="icon-big text-center">
                                <i class="fas fa-money-check"></i>
                            </div>
                        </div>
                        <div class="col-7 col-stats">
                            <div class="numbers">
                                <p class="card-category text-white">Total Esim</p>
                                <h4 class="card-title text-white">{{ number_format($totalEsim) }}</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </a>
    </div>

    <div class="col-sm-6 col-md-3">
        <a href="{{ route('admin.user.kyc.index','pending')}}">
            <div class="card card-stats card-round" style="background-color:#8f34eb; color:#000;">
                <div class="card-body">
                    <div class="row">
                        <div class="col-5">
                            <div class="icon-big text-center text-white">
                                <i class="fas fa-hourglass-half"></i>
                            </div>
                        </div>
                        <div class="col-7 col-stats">
                            <div class="numbers">
                                <p class="card-category text-white">Pending Kyc</p>
                                <h4 class="card-title text-white">{{ $pendingKyc }}</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </a>
    </div>

    <div class="col-sm-6 col-md-3">
        <a href="{{ route('admin.user.kyc.index','approved')}}">
            <div class="card card-stats card-round" style="background-color:#00BCD4; color:#fff;">
                <div class="card-body">
                    <div class="row">
                        <div class="col-5">
                            <div class="icon-big text-center">
                                <i class="far fa-check-square"></i>
                            </div>
                        </div>
                        <div class="col-7 col-stats">
                            <div class="numbers">
                                <p class="card-category text-white">Approved Kyc</p>
                                <h4 class="card-title text-white">{{ $approvedKyc }}</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </a>
    </div>

    <div class="col-sm-6 col-md-3">
        <a href="{{ route('admin.user.kyc.index','rejected')}}">
            <div class="card card-stats card-round" style="background-color:#795548; color:#fff;">
                <div class="card-body">
                    <div class="row">
                        <div class="col-5">
                            <div class="icon-big text-center">
                                <i class="fas fa-times-circle"></i>
                            </div>
                        </div>
                        <div class="col-7 col-stats">
                            <div class="numbers">
                                <p class="card-category text-white">Rejected Kyc</p>
                                <h4 class="card-title text-white">{{ $rejectedKyc }}</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </a>
    </div>
</div>



<div class="row">
    <div class="col-md-6">
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <div class="card-title">Orders</div>
                <select id="OrderChartFilter" class="form-control w-auto">
                    <option value="week" selected>This Week</option>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                </select>
            </div>
            <div class="card-body">
                <div class="chart-container">
                    <canvas id="orderBarChart"></canvas>
                </div>
            </div>
        </div>
    </div>


    <div class="col-md-6">
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <div class="card-title">Users</div>
                <select id="userChartFilter" class="form-control w-auto">
                    <option value="week">Last 7 Days</option>
                    <option value="month">Monthly</option>
                    <option value="year">Yearly</option>
                </select>
            </div>

            <div class="card-body">
                <div class="chart-container">
                    <canvas id="UserbarChart"></canvas>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-md-4">
        <div class="card card-round">
            <div class="card-body">
                <div class="card-head-row card-tools-still-right">
                    <div class="card-title">New Customers</div>
                </div>
                <div class="card-list py-4">
                    @foreach($latestUsers as $user)
                    <div class="item-list">
                        <div class="avatar">
                            <img
                                src="{{ $user->image ? asset($user->image) : asset('assets/defaultProfile.png') }}"
                                alt="..."
                                class="avatar-img rounded-circle" />
                        </div>
                        <div class="info-user ms-3">
                            <div class="username">{{$user->name ?? $user->email}}</div>
                            <div class="status">{{date('d M Y h:i A',strtotime($user->created_at))}}</div>
                        </div>
                    </div>
                    @endforeach

                </div>
            </div>
        </div>
    </div>
    <div class="col-md-8">
        <div class="card card-round">
            <div class="card-header">
                <div class="card-head-row card-tools-still-right">
                    <div class="card-title">Transaction History</div>

                </div>
            </div>
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-borderless table-striped table-hover align-middle mb-0">
                        <thead class="bg-dark text-white">
                            <tr>
                                <th scope="col">Payment</th>
                                <th scope="col" class="text-end">Date & Time</th>
                                <th scope="col" class="text-end">Amount</th>
                                <th scope="col" class="text-end">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($transactions as $tran)
                            <tr>
                                <!-- Payment Info -->
                                <td>
                                    <div class="d-flex align-items-center gap-3">
                                        <div class="rounded-circle bg-success text-white d-flex align-items-center justify-content-center"
                                            style="width:35px;height:35px;">
                                            <i class="fa fa-credit-card"></i>
                                        </div>
                                        <div>
                                            <div class="text-muted">{{$tran->payment_id}}</div>
                                            @if($tran->user)
                                            <div class="fw-bold text-dark">
                                                👤 <a href="{{route('admin.user.details',$tran->user->id)}}"
                                                    class="text-decoration-none">
                                                    {{$tran->user->name ?? $tran->user->email}}
                                                </a>
                                            </div>
                                            @endif
                                        </div>
                                    </div>
                                </td>

                                <!-- Date -->
                                <td class="text-end text-muted">
                                    <i class="fa fa-calendar-alt me-1"></i>
                                    {{$tran->updated_at->format('d M Y, h:i a')}}
                                </td>

                                <!-- Amount -->
                                <td class="text-end fw-bold">
                                    {{$tran->currency->symbol}} {{$tran->amount}}
                                </td>

                                <!-- Status -->
                                <td class="text-end">
                                    @if($tran->payment_status == 'paid')
                                    <span class="badge badge-success px-3 py-2">
                                        <i class="fa fa-check-circle me-1"></i> Paid
                                    </span>
                                    @else
                                    <span class="badge badge-warning text-dark px-3 py-2">
                                        <i class="fa fa-hourglass-half me-1"></i> Created
                                    </span>
                                    @endif
                                </td>
                            </tr>
                            @empty
                            <tr>
                                <td colspan="4" class="text-center text-muted py-4">
                                    <i class="fa fa-info-circle me-1"></i> No transactions found
                                </td>
                            </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>


        </div>
    </div>
</div>
<div class="row">
    <div class="col-md-12">
        <div class="card">
            <div class="card-header text-center">
                <h4 class="card-title">Top Destination</h4>
                <p class="card-category">
                    Esim Distribution by Region and Country
                </p>
                <div class="mt-3">
                    <select id="mapFilter" class="form-select w-auto mx-auto">
                        <option value="week">Last 7 Days</option>
                        <option value="month" selected>This Month</option>
                        <option value="year">This Year</option>
                    </select>
                </div>
            </div>
            <div class="card-body">
                <div class="col-md-10 ms-auto me-auto">
                    <div class="mapcontainer">
                        <div id="world-map" class="w-100" style="height: 450px"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<!-- jsvectormap -->
<script src="{{asset('assets/js/plugin/jsvectormap/jsvectormap.min.js')}}"></script>
<script src="{{asset('assets/js/plugin/jsvectormap/world.js')}}"></script>
<script>
    $("#lineChart").sparkline([102, 109, 120, 99, 110, 105, 115], {
        type: "line",
        height: "70",
        width: "100%",
        lineWidth: "2",
        lineColor: "#177dff",
        fillColor: "rgba(23, 125, 255, 0.14)",
    });

    $("#lineChart2").sparkline([99, 125, 122, 105, 110, 124, 115], {
        type: "line",
        height: "70",
        width: "100%",
        lineWidth: "2",
        lineColor: "#f3545d",
        fillColor: "rgba(243, 84, 93, .14)",
    });

    $("#lineChart3").sparkline([105, 103, 123, 100, 95, 105, 115], {
        type: "line",
        height: "70",
        width: "100%",
        lineWidth: "2",
        lineColor: "#ffa534",
        fillColor: "rgba(255, 165, 52, .14)",
    });

    let orderctx = document.getElementById("orderBarChart").getContext("2d");

    // Datasets from Laravel
    let datasets = {
        week: {
            labels: @json($weekLabels),
            data: @json($weekData)
        },
        month: {
            labels: @json($monthLabels),
            data: @json($monthData)
        },
        year: {
            labels: @json($yearLabels),
            data: @json($yearData)
        }
    };

    function buildChart(labels, data) {
        return new Chart(orderctx, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                        label: "Completed",
                        backgroundColor: "#59d05d",
                        data: data.completed
                    },
                    {
                        label: "Cancelled",
                        backgroundColor: "#177dff",
                        data: data.cancelled
                    },
                    {
                        label: "Failed",
                        backgroundColor: "#ff4d4d",
                        data: data.failed
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                legend: {
                    position: "bottom"
                },
                title: {
                    display: true,
                    text: "Orders by Status"
                },
                tooltips: {
                    mode: "index",
                    intersect: false
                },
                scales: {
                    xAxes: [{
                        stacked: true
                    }],
                    yAxes: [{
                        stacked: true
                    }]
                }
            }
        });
    }

    // Initial chart
    let orderChart = buildChart(datasets.week.labels, datasets.week.data);

    // On dropdown change
    document.getElementById("OrderChartFilter").addEventListener("change", function() {
        orderChart.destroy();
        let selected = this.value;
        orderChart = buildChart(datasets[selected].labels, datasets[selected].data);
    });


    // Laravel data injection
    const datasetsUser = {
        week: @json($userFilterWeek),
        month: @json($userFilterMonth),
        year: @json($userFilterYear)
    };

    const ctxUser = document.getElementById("UserbarChart").getContext("2d");

    function buildUserChart(labels, data) {
        return new Chart(ctxUser, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                    label: "User Registrations",
                    backgroundColor: "rgb(23, 125, 255)",
                    borderColor: "rgb(23, 125, 255)",
                    borderWidth: 1,
                    data: data
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Initial load
    let userChart = buildUserChart(
        datasetsUser.week.labels,
        datasetsUser.week.data
    );

    // Filter change event
    document.getElementById("userChartFilter").addEventListener("change", function() {
        const selected = this.value;
        userChart.destroy();
        userChart = buildUserChart(
            datasetsUser[selected].labels,
            datasetsUser[selected].data
        );
    });
</script>

<script>
    var mapdatasets = @json($mapData);
    var currentMap;

    function buildMap(data) {
        return new jsVectorMap({
            selector: "#world-map",
            map: "world",
            zoomOnScroll: false,
            regionStyle: {
                hover: {
                    fill: "#435ebe"
                },
                initial: {
                    fill: "#c8d6e5"
                }
            },
            series: {
                regions: [{
                    values: data,
                    scale: ['#dfe6e9', '#2d3436'],
                    normalizeFunction: 'polynomial'
                }]
            },
            onRegionTooltipShow(event, tooltip, code) {
                if (data[code]) {
                    tooltip.text(tooltip.text() + ' — ' + data[code] + ' Orders');
                }
            }
        });
    }

    // Initial map load
    currentMap = buildMap(mapdatasets['month']);

    // Change filter
    document.getElementById("mapFilter").addEventListener("change", function() {
        currentMap.destroy();
        let selected = this.value;
        currentMap = buildMap(mapdatasets[selected]);
    });
</script>
@endpush
