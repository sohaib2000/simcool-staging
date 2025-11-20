@extends('layouts.app')
@section('content')
<div class="row">
    <div class="col-md-12">
        <div class="card">
            <div class="card-header">
                <div class="row mb-4">
                    <div class="col-12">
                        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center p-3 border-bottom">
                            <h3 class="fw-bold text-dark mb-3 mb-md-0">
                                In-App Product Management
                            </h3>

                            <div class="d-flex gap-3">
                                <button class="btn btn-primary shadow-sm" data-bs-toggle="modal" data-bs-target="#createProductModal">
                                    <i class="fas fa-file-upload me-2"></i> Add Bulk Products
                                </button>

                                <!-- <a class="btn btn-outline-danger shadow-sm" href="{{ route('admin.iap.destroy') }}"
                                    onclick="return confirm('WARNING: Are you sure you want to delete ALL In-App Products? This action cannot be undone.')">
                                    <i class="fas fa-trash-alt me-2"></i> Delete All
                                </a> -->
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row g-4">

                    <div class="col-12 col-lg-6">
                        <div class="card shadow-lg border-0 h-100">
                            <div class="card-header bg-white border-bottom d-flex align-items-center">
                                <i class="fab fa-apple fa-lg text-dark me-2"></i>
                                <h5 class="mb-0 fw-bold">iOS Product Status</h5>
                            </div>
                            <div class="card-body p-4">
                                <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4">

                                    <div class="flex-grow-1">
                                        <span class="d-block text-muted text-uppercase fw-semibold mb-1 small">
                                            Pending Review
                                        </span>
                                        <span class="badge bg-primary-subtle text-primary p-3 fs-4 fw-bold w-100">
                                            <i class="fas fa-clock me-2"></i> {{ $products->where('isAppleUpload',0)->count() }}
                                        </span>
                                    </div>

                                    <div class="flex-grow-1">
                                        <span class="d-block text-muted text-uppercase fw-semibold mb-1 small">
                                            Successfully Uploaded
                                        </span>
                                        <span class="badge bg-success-subtle text-success p-3 fs-4 fw-bold w-100">
                                            <i class="fas fa-check-circle me-2"></i> {{ $products->where('isAppleUpload',1)->count() }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-12 col-lg-6">
                        <div class="card shadow-lg border-0 h-100">
                            <div class="card-header bg-white border-bottom d-flex align-items-center">
                                <i class="fab fa-android fa-lg text-success me-2"></i>
                                <h5 class="mb-0 fw-bold">Android Product Status</h5>
                            </div>
                            <div class="card-body p-4">
                                <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4">

                                    <div class="flex-grow-1">
                                        <span class="d-block text-muted text-uppercase fw-semibold mb-1 small">
                                            Pending Review
                                        </span>
                                        <span class="badge bg-warning-subtle text-warning p-3 fs-4 fw-bold w-100">
                                            <i class="fas fa-clock me-2"></i> {{ $products->where('isAndroidUpload',0)->count() }}
                                        </span>
                                    </div>

                                    <div class="flex-grow-1">
                                        <span class="d-block text-muted text-uppercase fw-semibold mb-1 small">
                                            Successfully Uploaded
                                        </span>
                                        <span class="badge bg-success-subtle text-success p-3 fs-4 fw-bold w-100">
                                            <i class="fas fa-check-circle me-2"></i> {{ $products->where('isAndroidUpload',1)->count() }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table id="basic-datatables" class="display table table-striped table-hover">
                        <thead>
                            <tr>
                                <th>SN#</th>
                                <th>Default Currency</th>
                                <th>SKU</th>
                                <th>Min Price</th>
                                <th>Max Price</th>
                                <th>Android</th>
                                <th>IOS</th>
                                <th>Created At</th>
                                <th>Updated At</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($products as $i => $product)
                            <tr>
                                <td>{{ $i + 1 }}</td>
                                <td>{{ $product->currency->name }}</td>
                                <td>{{ $product->sku }}</td>
                                <td>{{ $product->min_price }}</td>
                                <td>{{ $product->max_price }}</td>
                                <td>
                                    <span class="badge badge-{{$product->isAndroidUpload ? 'success' : 'warning'}}">{{$product->isAndroidUpload ? 'Uploaded' : 'Pending'}}</span>
                                </td>
                                <td>
                                    <span class="badge badge-{{$product->isAppleUpload ? 'success' : 'warning'}}">{{$product->isAppleUpload ? 'Uploaded' : 'Pending'}}</span>
                                </td>
                                <td>{{ date('d M Y h:i A', strtotime($product->created_at)) }}</td>
                                <td>{{ date('d M Y h:i A', strtotime($product->updated_at)) }}</td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>

                </div>
            </div>
        </div>
    </div>
</div>
<!-- Create Modal -->

<div class="modal fade" id="createProductModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <form action="{{route('admin.iap.store')}}" method="POST">
                @csrf
                <div class="modal-header">
                    <h5 class="modal-title">Bulk Products</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="">Products <span class="text-danger">*</span> (Note:you can,t create more then 999 products)</label>
                        <input type="number" name="product_count" class="form-control" required>
                        <input type="hidden" value="{{$currencyId}}" name="currency">
                    </div>
                    <div class="mb-3">
                        <label for="">Price Range <span class="text-danger">*</span></label>
                        <input type="text" name="price_range" class="form-control" required>
                    </div>

                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="submit" class="btn btn-primary">Submit</button>
                </div>
            </form>
        </div>
    </div>
</div>

@endsection
