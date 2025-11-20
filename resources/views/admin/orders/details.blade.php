@extends('layouts.app')
@push('styles')
<style>
    .container-fluid {
        padding-top: 20px;
        padding-bottom: 20px;
    }

    .card {
        border-radius: 0.75rem;
        /* Rounded corners for cards */
        box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
        margin-bottom: 1.5rem;
    }

    .card-header {
        background-color: #e9ecef;
        border-bottom: 1px solid rgba(0, 0, 0, 0.125);
        font-weight: 600;
        border-top-left-radius: 0.75rem;
        border-top-right-radius: 0.75rem;
    }

    .form-control:focus,
    .btn:focus {
        box-shadow: none !important;
    }

    .btn-primary {
        background-color: #007bff;
        border-color: #007bff;
        border-radius: 0.5rem;
    }

    .btn-primary:hover {
        background-color: #0056b3;
        border-color: #0056b3;
    }

    .btn-success {
        background-color: #28a745;
        border-color: #28a745;
        border-radius: 0.5rem;
    }

    .btn-success:hover {
        background-color: #218838;
        border-color: #218838;
    }

    .badge {
        font-size: 0.9em;
        padding: 0.5em 0.7em;
        border-radius: 0.5rem;
    }

    .badge-pending {
        background-color: #ffc107;
        color: #343a40;
    }

    .badge-completed {
        background-color: #28a745;
        color: #fff;
    }

    .badge-cancelled {
        background-color: #dc3545;
        color: #fff;
    }

    .badge-processing {
        background-color: #17a2b8;
        color: #fff;
    }

    .list-group-item {
        border-radius: 0.5rem;
        /* Rounded corners for list items */
        margin-bottom: 0.5rem;
        /* Space between list items */
    }

    .list-group-item:last-child {
        margin-bottom: 0;
    }
</style>
@endpush
@section('content')

<div class="container-fluid mt-4">
    <div class="row">
        <div class="col-12 mb-4">
            <h2 class="display-6 fw-bold text-center text-primary">Order Details <span class="text-secondary">#{{$order->order_ref}}</span></h2>
            <p class="lead text-center text-muted">Detailed view of a specific eSIM order.</p>
        </div>
    </div>

    <div class="row justify-content-center">
        <div class="col-lg-10 col-md-12">
            <!-- Order Summary Card -->
            <div class="card shadow-sm mb-4">
                <div class="card-header d-flex justify-content-between align-items-center">
                    Order Summary
                    <span class="badge badge-processing">{{(ucfirst($order->status) == 'Pending') ? 'Failed' : ucfirst($order->status)}}</span>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <p class="mb-1"><strong>Order ID:</strong> {{$order->order_ref}}</p>
                            <p class="mb-1"><strong>Order Date:</strong> {{date('d M Y h:i A',strtotime($order->created_at))}}</p>
                            <p class="mb-1"><strong>Payment Status:</strong> <span class="badge bg-success">{{ucfirst(@$order->payment->payment_status)}}</span></p>
                        </div>
                        <div class="col-md-6">
                            <p class="mb-1"><strong>Total Amount:</strong> {{@$order->currency->symbol}} {{@$order->total_amount}}</p>
                            <p class="mb-1"><strong>Payment Mode:</strong> {{@$order->payment->payment_mode}}</p>
                            <p class="mb-1"><strong>Transaction ID:</strong> {{@$order->payment->payment_id ?? @$order->payment->gateway_order_id }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Customer Information Card -->
            <div class="card shadow-sm mb-4">
                <div class="card-header">
                    Customer Information
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <p class="mb-1"><strong>Name:</strong> {{$order->user->name ?? 'N/A'}}</p>
                            <p class="mb-1"><strong>Email:</strong> {{$order->user->email ?? 'N/A'}}</p>
                        </div>

                    </div>
                </div>
            </div>
            @if($order->package->type == 'topup')
            <div class="card shadow-sm mb-4">
                <div class="card-header">
                    TopUp Details
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <p class="mb-1"><strong>Plan Name:</strong> {{$order->package->name}}</p>
                            <p class="mb-1"><strong>Data:</strong> {{$order->package->data}}</p>
                            <p class="mb-1"><strong>Validity:</strong> {{@$order->package->day}} Days</p>
                            <p class="mb-1"><strong>Price:</strong> {{@$order->currency->symbol}} {{@$order->total_amount}}</p>
                        </div>
                        <div class="col-md-6">
                            <p class="mb-1"><strong>ICCID:</strong> {{ @$topuphistory->iccid }}</p>
                        </div>
                    </div>
                    @if($order->esims)
                    <hr>
                    <h5>QR Code / Manual Setup Details:</h5>
                    <div class="row mt-3">
                        <div class="col-md-4 text-center">
                            <img src="{{@$order->esims->qrcode_url}}" alt="eSIM QR Code" class="img-fluid rounded shadow-sm mb-2">
                            <small class="text-muted d-block">Scan to activate</small>
                        </div>
                        <div class="col-md-8">
                            <p class="mb-1"><strong>Activation Code (Confirmation Code):</strong> {{@$order->esims->qrcode}}</p>
                            <button class="btn btn-outline-secondary btn-sm mt-2" onclick="copyToClipboard(`{{@$order->esims->qrcode}}`)">
                                <i class="far fa-copy me-1"></i> Copy Activation Code
                            </button>
                            <div id="copySuccess" class="text-success mt-2 d-none">Copied!</div>
                        </div>
                    </div>
                    @endif
                </div>
            </div>
            @else
            <!-- eSIM Details Card -->
            <div class="card shadow-sm mb-4">
                <div class="card-header">
                    eSIM Details
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <p class="mb-1"><strong>Plan Name:</strong> {{$order->package->name}}</p>
                            <p class="mb-1"><strong>Data:</strong> {{$order->package->data}}</p>
                            <p class="mb-1"><strong>Validity:</strong> {{@$order->package->day}} Days</p>
                            <p class="mb-1"><strong>Price:</strong> {{@$order->currency->symbol}} {{@$order->total_amount}}</p>
                        </div>
                        <div class="col-md-6">
                            <p class="mb-1"><strong>eSIM Status:</strong> <span class="badge bg-info text-dark">{{@$order->esims->status}}</span></p>
                            <p class="mb-1"><strong>ICCID:</strong> {{ @$order->esims->iccid }}</p>
                        </div>
                    </div>
                    @if($order->esims)
                    <hr>
                    <h5>QR Code / Manual Setup Details:</h5>
                    <div class="row mt-3">
                        <div class="col-md-4 text-center">
                            <img src="{{@$order->esims->qrcode_url}}" alt="eSIM QR Code" class="img-fluid rounded shadow-sm mb-2">
                            <small class="text-muted d-block">Scan to activate</small>
                        </div>
                        <div class="col-md-8">
                            <p class="mb-1"><strong>Activation Code (Confirmation Code):</strong> {{@$order->esims->qrcode}}</p>
                            <button class="btn btn-outline-secondary btn-sm mt-2" onclick="copyToClipboard(`{{@$order->esims->qrcode}}`)">
                                <i class="far fa-copy me-1"></i> Copy Activation Code
                            </button>
                            <div id="copySuccess" class="text-success mt-2 d-none">Copied!</div>
                        </div>
                    </div>
                    @endif
                </div>
            </div>
            @endif
            @if(!empty($order->activation_details))
            @php
            // Decode JSON safely
            $activationDetails = is_array($order->activation_details)
            ? $order->activation_details
            : json_decode($order->activation_details, true);

            // Function to detect if a string has HTML tags
            function containsHtml($value) {
            return $value !== strip_tags($value);
            }

            // Recursive render function
            function renderJsonDetails($data, $level = 0) {
            $indent = $level * 15;
            $html = '<ul class="list-group border-0" style="padding-left: '.$indent.'px;">';

                foreach ($data as $key => $value) {
                $formattedKey = ucwords(str_replace('_', ' ', $key));

                if (is_array($value) || is_object($value)) {
                $html .= '<li class="list-group-item bg-light"><strong>'.$formattedKey.':</strong>';
                    $html .= renderJsonDetails((array)$value, $level + 1);
                    $html .= '</li>';
                } else {
                $safeValue = trim((string)$value);

                // Check if value contains HTML tags
                if (containsHtml($safeValue)) {
                // Render as raw HTML (only safe tags allowed)
                $renderedValue = strip_tags($safeValue, '<b><i><u><br><strong><em><span><small><a>');
                                                } else {
                                                // Escape for plain text display
                                                $renderedValue = e($safeValue);
                                                }

                                                $html .= '
                                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                                    <strong>'.$formattedKey.'</strong>
                                                    <code class="text-muted text-end">'.$renderedValue.'</code>
                                                </li>';
                                                }
                                                }

                                                $html .= '</ul>';
            return $html;
            }
            @endphp
            @if(!empty($activationDetails))
            <div class="card shadow-sm mb-4">
                <div class="card-header">
                    Activation Details
                </div>
                <div class="card-body">
                    {!! renderJsonDetails($activationDetails) !!}
                </div>
            </div>
            @endif
            @endif


        </div>
    </div>
</div>
<script>
    function copyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy'); // Use execCommand for broader compatibility in iframes
        document.body.removeChild(textarea);

        const copySuccess = document.getElementById('copySuccess');
        copySuccess.classList.remove('d-none');
        setTimeout(() => {
            copySuccess.classList.add('d-none');
        }, 2000); // Hide message after 2 seconds
    }
</script>
@endsection
