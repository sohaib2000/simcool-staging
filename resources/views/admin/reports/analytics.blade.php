@extends('layouts.app')
@section('content')
<div class="row">
    <div class="col-md-12">
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">

                <h4 class="card-title">Analytics</h4>
                <div class="d-flex">
                    <!-- Period filter -->
                    <select id="reportChartFilter" class="form-control w-auto">
                        <option value="week">Last 7 Days</option>
                        <option value="month">Last 30 Days</option>
                        <option value="year">Yearly</option>
                    </select>

                    <!-- Currency filter -->
                    <select id="reportCurrencyFilter" class="form-control w-auto">
                        @foreach($currencies as $currency)
                        <option value="{{ $currency->name }}" {{ $currency->name == 'USD' ? 'selected' : '' }}>{{ $currency->name }}</option>
                        @endforeach
                    </select>
                </div>

            </div>
            <div class="card-body">
                <div class="d-flex justify-content-between mb-2">
                    <ul class="nav nav-tabs">
                        <li class="nav-item">
                        </li>
                    </ul>
                    <div id="reportTotal" class="fw-bold fs-5"></div>
                </div>

                <div class="chart-container" style="height:300px">
                    <canvas id="ReportBarChart"></canvas>
                </div>
            </div>
        </div>
    </div>
</div>

@endsection

@push('scripts')
<script src="{{asset('assets/js/plugin/jsvectormap/jsvectormap.min.js')}}"></script>
<script src="{{asset('assets/js/plugin/jsvectormap/world.js')}}"></script>
<script>
    const datasetsReport = @json($reportData);

    const ctxReport = document.getElementById("ReportBarChart").getContext("2d");
    const reportTotalEl = document.getElementById("reportTotal");

    function getChartData(currency, period) {
        if (datasetsReport[currency] && datasetsReport[currency][period]) {
            return {
                labels: datasetsReport[currency][period].labels,
                success: datasetsReport[currency][period].success,
                failed: datasetsReport[currency][period].failed,
                cancelled: datasetsReport[currency][period].cancelled,
                totals: datasetsReport[currency][period].totals,
                symbol: datasetsReport[currency].symbol
            };
        }
        return {
            labels: [],
            success: [],
            failed: [],
            cancelled: [],
            totals: {},
            symbol: ""
        };
    }

    function buildReportChart(labels, chartData, currencySymbol) {
        return new Chart(ctxReport, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                        label: "Completed (" + currencySymbol + ")",
                        backgroundColor: "rgb(40, 167, 69)", // green
                        data: chartData.success
                    },
                    {
                        label: "Failed (" + currencySymbol + ")",
                        backgroundColor: "rgb(220, 53, 69)", // red
                        data: chartData.failed
                    },
                    {
                        label: "Cancelled (" + currencySymbol + ")",
                        backgroundColor: "rgb(255, 193, 7)", // yellow
                        data: chartData.cancelled
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return currencySymbol + value;
                            }
                        }
                    }
                }
            }
        });
    }


    // --- Initial load (USD + week) ---
    let selectedCurrency = document.querySelector("#reportCurrencyFilter").value;
    let selectedPeriod = document.querySelector("#reportChartFilter").value;
    let chartData = getChartData(selectedCurrency, selectedPeriod);

    let reportChart = buildReportChart(chartData.labels, chartData, chartData.symbol);
    if (reportTotalEl) {
        reportTotalEl.innerText =
            "Completed: " + chartData.symbol + chartData.totals.success.toFixed(2) + " | " +
            "Failed: " + chartData.symbol + chartData.totals.failed.toFixed(2) + " | " +
            "Cancelled: " + chartData.symbol + chartData.totals.cancelled.toFixed(2);
    }

    // --- Period change ---
   document.getElementById("reportChartFilter").addEventListener("change", function () {
    selectedPeriod = this.value;
    reportChart.destroy();
    chartData = getChartData(selectedCurrency, selectedPeriod);
    reportChart = buildReportChart(chartData.labels, chartData, chartData.symbol);
    if (reportTotalEl) {
        reportTotalEl.innerText =
            "Completed: " + chartData.symbol + chartData.totals.success.toFixed(2) + " | " +
            "Failed: " + chartData.symbol + chartData.totals.failed.toFixed(2) + " | " +
            "Cancelled: " + chartData.symbol + chartData.totals.cancelled.toFixed(2);
    }
});

    // --- Currency change ---
  document.getElementById("reportCurrencyFilter").addEventListener("change", function () {
    selectedCurrency = this.value;
    reportChart.destroy();
    chartData = getChartData(selectedCurrency, selectedPeriod);
    reportChart = buildReportChart(chartData.labels, chartData, chartData.symbol);
    if (reportTotalEl) {
        reportTotalEl.innerText =
            "Completed: " + chartData.symbol + chartData.totals.success.toFixed(2) + " | " +
            "Failed: " + chartData.symbol + chartData.totals.failed.toFixed(2) + " | " +
            "Cancelled: " + chartData.symbol + chartData.totals.cancelled.toFixed(2);
    }
});
</script>

@endpush
