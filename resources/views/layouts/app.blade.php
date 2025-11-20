<!DOCTYPE html>
<html lang="en">

<head>
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>{{systemflag('appName')}}</title>
    <meta
        content="width=device-width, initial-scale=1.0, shrink-to-fit=no"
        name="viewport" />
    <link
        rel="icon"
        href="{{systemflag('favicon') ? asset(systemflag('favicon')) : asset('assets/adminlogo.png') }}"
        type="image/x-icon" />

    <script src="{{ asset('assets/js/plugin/webfont/webfont.min.js') }}"></script>
    <script>
        WebFont.load({
            google: {
                families: ["Public Sans:300,400,500,600,700"]
            },
            custom: {
                families: [
                    "Font Awesome 5 Solid",
                    "Font Awesome 5 Regular",
                    "Font Awesome 5 Brands",
                    "simple-line-icons",
                ],
                urls: ["{{ asset('assets/css/fonts.min.css') }}"],
            },
            active: function() {
                sessionStorage.fonts = true;
            },
        });
    </script>
    <link rel="stylesheet" href="{{ asset('assets/css/bootstrap.min.css') }}" />
    <link rel="stylesheet" href="{{ asset('assets/css/plugins.min.css') }}" />
    <link rel="stylesheet" href="{{ asset('assets/css/kaiadmin.min.css') }}" />
    <link rel="stylesheet" href="{{ asset('assets/css/custom.css') }}" />

    <link rel="stylesheet" href="{{ asset('assets/css/demo.css') }}" />
    <link href="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.css" rel="stylesheet" />

    <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.css" />
    <style>
        /* Success message */
        .toast-success {
            background-color: #28a745 !important;
            /* Bootstrap green */
            color: white !important;
        }

        /* Error message */
        .toast-error {
            background-color: #dc3545 !important;
            /* Bootstrap red */
            color: white !important;
        }

        /* Optional: text color for title and message */
        .toast-title,
        .toast-message {
            color: white !important;
        }
    </style>
    @stack('styles')
</head>

<body>
    <div class="wrapper">
        @include('partials.sidebar')

        <div class="main-panel">
            @include('partials.navbar')

            <div class="container">
                <div class="page-inner">
                    {{-- <div class="page-header">
                        @php
                        $segments = Request::segments();
                        $url = url('/');
                        @endphp

                        <ul class="breadcrumbs mb-3">
                            <li class="nav-home">
                                <a href="{{ route('admin.dashboard') }}">
                    <i class="icon-home"></i>
                    </a>
                    </li>

                    @foreach ($segments as $index => $segment)
                    @php
                    $url .= '/' . $segment;
                    $isLast = $loop->last;
                    $label = ucfirst(str_replace('-', ' ', $segment));
                    if($label == 'Admin'){
                    $url = route('admin.dashboard');
                    $label = 'Dashboard';

                    }
                    @endphp

                    <li class="separator">
                        <i class="icon-arrow-right"></i>
                    </li>

                    <li class="nav-item {{ $isLast ? 'active' : '' }}">
                        @if ($isLast)
                        <span>{{ $label }}</span>
                        @else
                        <a href="{{ $url }}">{{ $label }}</a>
                        @endif
                    </li>
                    @endforeach
                    </ul>
                </div> --}}
                @yield('content')
            </div>
        </div>

        @include('partials.footer')
    </div>

    <div class="custom-template">
        <div class="title">Settings</div>
        <div class="custom-content">
            <div class="switcher">
                <div class="switch-block">
                    <h4>Logo Header</h4>
                    <div class="btnSwitch">
                        <button
                            type="button"
                            class="selected changeLogoHeaderColor"
                            data-color="dark"></button>
                        <button
                            type="button"
                            class="changeLogoHeaderColor"
                            data-color="blue"></button>
                        <button
                            type="button"
                            class="changeLogoHeaderColor"
                            data-color="purple"></button>
                        <button
                            type="button"
                            class="changeLogoHeaderColor"
                            data-color="light-blue"></button>
                        <button
                            type="button"
                            class="changeLogoHeaderColor"
                            data-color="green"></button>
                        <button
                            type="button"
                            class="changeLogoHeaderColor"
                            data-color="orange"></button>
                        <button
                            type="button"
                            class="changeLogoHeaderColor"
                            data-color="red"></button>
                        <button
                            type="button"
                            class="changeLogoHeaderColor"
                            data-color="white"></button>
                        <br />
                        <button
                            type="button"
                            class="changeLogoHeaderColor"
                            data-color="dark2"></button>
                        <button
                            type="button"
                            class="changeLogoHeaderColor"
                            data-color="blue2"></button>
                        <button
                            type="button"
                            class="changeLogoHeaderColor"
                            data-color="purple2"></button>
                        <button
                            type="button"
                            class="changeLogoHeaderColor"
                            data-color="light-blue2"></button>
                        <button
                            type="button"
                            class="changeLogoHeaderColor"
                            data-color="green2"></button>
                        <button
                            type="button"
                            class="changeLogoHeaderColor"
                            data-color="orange2"></button>
                        <button
                            type="button"
                            class="changeLogoHeaderColor"
                            data-color="red2"></button>
                    </div>
                </div>
                <div class="switch-block">
                    <h4>Navbar Header</h4>
                    <div class="btnSwitch">
                        <button
                            type="button"
                            class="changeTopBarColor"
                            data-color="dark"></button>
                        <button
                            type="button"
                            class="changeTopBarColor"
                            data-color="blue"></button>
                        <button
                            type="button"
                            class="changeTopBarColor"
                            data-color="purple"></button>
                        <button
                            type="button"
                            class="changeTopBarColor"
                            data-color="light-blue"></button>
                        <button
                            type="button"
                            class="changeTopBarColor"
                            data-color="green"></button>
                        <button
                            type="button"
                            class="changeTopBarColor"
                            data-color="orange"></button>
                        <button
                            type="button"
                            class="changeTopBarColor"
                            data-color="red"></button>
                        <button
                            type="button"
                            class="selected changeTopBarColor"
                            data-color="white"></button>
                        <br />
                        <button
                            type="button"
                            class="changeTopBarColor"
                            data-color="dark2"></button>
                        <button
                            type="button"
                            class="changeTopBarColor"
                            data-color="blue2"></button>
                        <button
                            type="button"
                            class="changeTopBarColor"
                            data-color="purple2"></button>
                        <button
                            type="button"
                            class="changeTopBarColor"
                            data-color="light-blue2"></button>
                        <button
                            type="button"
                            class="changeTopBarColor"
                            data-color="green2"></button>
                        <button
                            type="button"
                            class="changeTopBarColor"
                            data-color="orange2"></button>
                        <button
                            type="button"
                            class="changeTopBarColor"
                            data-color="red2"></button>
                    </div>
                </div>
                <div class="switch-block">
                    <h4>Sidebar</h4>
                    <div class="btnSwitch">
                        <button
                            type="button"
                            class="changeSideBarColor"
                            data-color="white"></button>
                        <button
                            type="button"
                            class="selected changeSideBarColor"
                            data-color="dark"></button>
                        <button
                            type="button"
                            class="changeSideBarColor"
                            data-color="dark2"></button>
                    </div>
                </div>
            </div>
        </div>
        <div class="custom-toggle">
            <i class="icon-settings"></i>
        </div>
    </div>
    </div>
    <script src="{{ asset('assets/js/core/jquery-3.7.1.min.js') }}"></script>
    <script src="{{ asset('assets/js/core/popper.min.js') }}"></script>
    <script src="{{ asset('assets/js/core/bootstrap.min.js') }}"></script>

    <script src="{{ asset('assets/js/plugin/jquery-scrollbar/jquery.scrollbar.min.js') }}"></script>

    <script src="{{ asset('assets/js/plugin/chart.js/chart.min.js') }}"></script>

    <script src="{{ asset('assets/js/plugin/jquery.sparkline/jquery.sparkline.min.js') }}"></script>

    <script src="{{ asset('assets/js/plugin/chart-circle/circles.min.js') }}"></script>

    <script src="{{ asset('assets/js/plugin/datatables/datatables.min.js') }}"></script>

    <script src="{{ asset('assets/js/plugin/bootstrap-notify/bootstrap-notify.min.js') }}"></script>

    <script src="{{ asset('assets/js/plugin/select2/select2.full.min.js') }}"></script>

    <script src="{{ asset('assets/js/plugin/sweetalert/sweetalert.min.js') }}"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.js"></script>
    <script src="{{ asset('assets/js/kaiadmin.min.js') }}"></script>

    <script src="{{ asset('assets/js/setting-demo.js') }}"></script>
    <script src="{{ asset('assets/js/plugin/summernote/summernote-lite.min.js') }}"></script>

    <script type="text/javascript" src="https://cdn.jsdelivr.net/momentjs/latest/moment.min.js"></script>
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.min.js"></script>

    @stack('scripts')
    <script>
        toastr.options = {
            "positionClass": "toast-top-right",
            "progressBar": true,
            "closeButton": true,
        };
    </script>
    @if(session('success'))
    <script>
        toastr.success("{{ session('success') }}");
    </script>
    @endif
    @if(session('error'))
    <script>
        toastr.error("{{ session('error') }}");
    </script>
    @endif
    <script>
        $(document).ready(function() {
            // Initialize all select2s
            $('.select2').each(function() {
                $(this).select2({
                    dropdownParent: $(this).closest('.modal').length ? $(this).closest('.modal') : $('body'),
                    width: '100%',
                    placeholder: $(this).attr('placeholder') || 'Select an option',
                    allowClear: true
                });
            });
        });

        $('.summernote').summernote({
            placeholder: 'Write something...',
            tabsize: 2,
            height: 200
        });
        $("#basic-datatables").DataTable({});

        document.addEventListener("DOMContentLoaded", function() {
            document.querySelectorAll('.btn-delete').forEach(function(button) {
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    let form = this.closest('form');
                    let action = form.getAttribute('action');
                    let method = form.querySelector('input[name="_method"]')?.value || form.method;

                    swal({
                        title: "Are you sure?",
                        text: "Once deleted, you will not be able to recover this record!",
                        icon: "warning",
                        buttons: {
                            cancel: {
                                text: "Cancel",
                                visible: true,
                                className: "btn btn-secondary"
                            },
                            confirm: {
                                text: "Yes, delete it!",
                                className: "btn btn-danger"
                            }
                        },
                        dangerMode: true,
                    }).then((willDelete) => {
                        if (willDelete) {
                           form.submit();
                        }
                    });
                });
            });
        });

        $(function() {

            var start = moment().subtract(29, 'days');
            var end = moment();

            function cb(start, end) {
                $('#reportrange span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
                $('#start_date').val(start.format('YYYY-MM-DD'));
                $('#end_date').val(end.format('YYYY-MM-DD'));
            }

            $('#reportrange').daterangepicker({
                startDate: start,
                endDate: end,
                ranges: {
                    'Today': [moment(), moment()],
                    'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                    'This Month': [moment().startOf('month'), moment().endOf('month')],
                    'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
                }
            }, cb);

            cb(start, end);

        });
        $(document).ajaxError(function(event, xhr, settings) {
            if (xhr.status === 403) {
                try {
                    let response = JSON.parse(xhr.responseText);
                    swal("Permission Denied!", response.message, "error");
                } catch (e) {
                    swal("Access Denied!", "You do not have permission to perform this action.", "error");
                }
            }
        });
        document.addEventListener("DOMContentLoaded", function() {
            document.querySelectorAll('.viewKycBtn').forEach(function(button) {
                button.addEventListener('click', function(e) {
                    if (this.dataset.noPermission) {
                        e.preventDefault();
                        e.stopPropagation();
                        swal("Permission Denied!", "You do not have permission to view KYC details.", "error");
                    }
                });
            });
        });
    </script>
</body>

</html>
