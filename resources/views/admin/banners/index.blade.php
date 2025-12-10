@extends('layouts.app')
@section('content')
<div class="row">
    <div class="col-md-12">
        <div class="card">
            <div class="card-header d-flex justify-content-between">
                <h4 class="card-title">Banners</h4>
                <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#createBannerModal">
                    Create Banner
                </button>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="display table table-striped table-hover">
                        <thead>
                            <tr>
                                <th>SN#</th>
                                <th>Name</th>
                                <th>Image</th>
                                <th>Created At</th>
                                <th>Updated At</th>
                                <th>Is Active</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($banners as $i => $banner)
                            <tr>
                                <td>{{ $i+1 }}</td>
                                <td>{{ $banner->name }}</td>
                                <td>
                                    @if($banner->image)
                                    <img src="{{ asset($banner->image) }}" alt="Banner" width="80" height="50" style="object-fit:cover;">
                                    @else
                                    No image
                                    @endif
                                </td>
                                <td>{{ $banner->created_at->format('d M Y h:i A') }}</td>
                                <td>{{ $banner->updated_at->format('d M Y h:i A') }}</td>
                                <td>
                                    <div class="form-check form-switch align-items-center justify-content-center">
                                        <input class="form-check-input banner-toggle custom-switch"
                                            data-id="{{ $banner->id }}"
                                            {{ $banner->is_active ? 'checked' : '' }}
                                            type="checkbox" role="switch">
                                    </div>
                                </td>
                                <td>
                                    <button class="btn btn-sm btn-warning edit-btn"
                                        data-id="{{ $banner->id }}"
                                        data-name="{{ $banner->name }}"
                                        data-image="{{ @$banner->image ? asset($banner->image) : '' }}"
                                        data-country="{{ @$banner->package->country_ids}}"
                                        data-region="{{ @$banner->package->region_id}}"
                                        data-from="{{ @$banner->banner_from}}"
                                        data-to="{{ $banner->banner_to}}"
                                        data-package="{{ $banner->package_id}}"
                                        data-active="{{ $banner->is_active }}">
                                        Edit
                                    </button>
                                    <form action="{{ route('admin.banners.destroy', $banner) }}" method="POST" class="d-inline delete-form">
                                        @csrf
                                        @method('DELETE')
                                        <button type="button" class="btn btn-sm btn-danger btn-delete">Delete</button>
                                    </form>
                                </td>
                            </tr>
                            @empty
                            <tr class="text-center">
                                <td colspan="7">No banners found.</td>
                            </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
                {{ $banners->links() }}
            </div>
        </div>
    </div>
</div>

<!-- Create Modal -->
<div class="modal fade" id="createBannerModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <form action="{{ route('admin.banners.store') }}" method="POST" enctype="multipart/form-data">
                @csrf
                <div class="modal-header">
                    <h5 class="modal-title">Create Banner</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">

                    <!-- Name -->
                    <div class="mb-3">
                        <label>Name</label>
                        <input type="text" name="name" class="form-control" required>
                    </div>

                    <!-- Country / Region -->
                    <div class="row">
                        <div class="col-md-6">
                            <label>Country</label>
                            <select class="form-control select2" name="country_id" id="countrySelect">
                                <option value="" selected>Select Country</option>
                                @foreach($countries as $country)
                                <option value="{{ $country->id }}">{{ $country->name }} ({{ $country->country_code }})</option>
                                @endforeach
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label>Region</label>
                            <select class="form-control select2" name="region_id" id="regionSelect">
                                <option value="" selected>Select Region</option>
                                @foreach($regions as $region)
                                <option value="{{ $region->id }}">{{ $region->name }}</option>
                                @endforeach
                            </select>
                        </div>
                    </div>

                    <!-- Packages -->
                    <div class="mt-3" id="packagesContainer" style="display:none;">
                        <label>Packages</label>
                        <select class="form-control select2" name="package_id" id="packageSelect">
                            <option value="" selected>Select Package</option>
                        </select>
                    </div>

                    <!-- Dates -->
                    <div class="row mt-3">
                        <div class="col-md-6">
                            <label>Banner From</label>
                            <input type="date" class="form-control" name="banner_from" id="bannerFrom" min="{{ date('Y-m-d') }}" required>
                        </div>
                        <div class="col-md-6">
                            <label>Banner To</label>
                            <input type="date" class="form-control" name="banner_to" id="bannerTo" min="{{ date('Y-m-d') }}" required>
                        </div>
                    </div>

                    <!-- Image -->
                    <div class="mt-3">
                        <label>Image</label>
                        <input type="file" name="image" class="form-control image-input" required>
                        <img class="mt-2 preview-img" src="" style="display:none; max-width:100px;">
                    </div>

                    <!-- Active -->
                    <div class="form-check mt-2">
                        <input type="checkbox" class="form-check-input" name="is_active" value="1">
                        <label class="form-check-label">Active</label>
                    </div>

                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="submit" class="btn btn-primary">Create</button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Edit Modal -->
<div class="modal fade" id="editBannerModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <form id="editBannerForm" method="POST" enctype="multipart/form-data">
                @csrf
                @method('PUT')
                <div class="modal-header">
                    <h5 class="modal-title">Edit Banner</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">

                    <!-- Name -->
                    <div class="mb-3">
                        <label>Name</label>
                        <input type="text" name="name" id="editName" class="form-control" required>
                    </div>

                    <!-- Country / Region -->
                    <div class="row">
                        <div class="col-md-6">
                            <label>Country</label>
                            <select class="form-control select2" name="country_id" id="editCountrySelect">
                                <option value="" selected>Select Country</option>
                                @foreach($countries as $country)
                                <option value="{{ $country->id }}">{{ $country->name }} ({{ $country->country_code }})</option>
                                @endforeach
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label>Region</label>
                            <select class="form-control select2" name="region_id" id="editRegionSelect">
                                <option value="" selected>Select Region</option>
                                @foreach($regions as $region)
                                <option value="{{ $region->id }}">{{ $region->name }}</option>
                                @endforeach
                            </select>
                        </div>
                    </div>

                    <!-- Packages -->
                    <div class="mt-3" id="editPackagesContainer" style="display:none;">
                        <label>Packages</label>
                        <select class="form-control select2" name="package_id" id="editPackageSelect">
                            <option value="" selected>Select Package</option>
                        </select>
                    </div>

                    <!-- Dates -->
                    <div class="row mt-3">
                        <div class="col-md-6">
                            <label>Banner From</label>
                            <input type="date" class="form-control" name="banner_from" id="editBannerFrom" min="{{ date('Y-m-d') }}" required>
                        </div>
                        <div class="col-md-6">
                            <label>Banner To</label>
                            <input type="date" class="form-control" name="banner_to" id="editBannerTo" min="{{ date('Y-m-d') }}" required>
                        </div>
                    </div>

                    <!-- Image -->
                    <div class="mt-3">
                        <label>Image</label>
                        <input type="file" name="image" class="form-control image-input">
                        <img id="editPreview" class="mt-2" src="" style="display:none; max-width:100px;">
                    </div>

                    <!-- Active -->
                    <div class="form-check mt-2">
                        <input type="checkbox" class="form-check-input" name="is_active" id="editIsActive" value="1">
                        <label class="form-check-label">Active</label>
                    </div>

                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="submit" class="btn btn-primary">Update</button>
                </div>
            </form>
        </div>
    </div>
</div>


@push('scripts')
<script>
    $(function() {

        // =======================
        // Image preview (Create & Edit)
        // =======================
        $(document).on('change', '.image-input', function() {
            let input = this;
            let preview = $(this).siblings('.preview-img').length ?
                $(this).siblings('.preview-img') :
                $('#editPreview');

            if (input.files && input.files[0]) {
                let reader = new FileReader();
                reader.onload = function(e) {
                    preview.attr('src', e.target.result).show();
                };
                reader.readAsDataURL(input.files[0]);
            }
        });

        // =======================
        // Edit button click handler
        // =======================
        $('.edit-btn').on('click', function() {
            let id = $(this).data('id');
            let name = $(this).data('name');
            let image = $(this).data('image');
            let active = $(this).data('active');
            let countryId = $(this).data('country');
            let regionId = $(this).data('region');
            let packageId = $(this).data('package');
            let fromDate = $(this).data('from');
            let toDate = $(this).data('to');

            $('#editName').val(name);
            $('#editIsActive').prop('checked', active == 1);
            $('#editBannerFrom').val(fromDate);
            $('#editBannerTo').val(toDate);

            if (image) {
                $('#editPreview').attr('src', image).show();
            } else {
                $('#editPreview').hide();
            }

            // Reset selects
            $('#editCountrySelect').val(countryId).trigger('change');
            $('#editRegionSelect').val(regionId).trigger('change');

            // Load packages for edit
            if (countryId) {
                fetchPackages({
                    country_id: countryId
                }, '#editPackageSelect', '#editPackagesContainer', packageId);
            } else if (regionId) {
                fetchPackages({
                    region_id: regionId
                }, '#editPackageSelect', '#editPackagesContainer', packageId);
            }

            // Set form action dynamically
            $('#editBannerForm').attr('action', '/admin/banners/' + id);
            $('#editBannerModal').modal('show');
        });

        // =======================
        // Country/Region change (Create)
        // =======================
        $('#countrySelect').change(function() {
            if ($(this).val()) {
                $('#regionSelect').val('').trigger('change');
                fetchPackages({
                    country_id: $(this).val()
                }, '#packageSelect', '#packagesContainer');
            } else {
                $('#packagesContainer').hide();
            }
        });

        $('#regionSelect').change(function() {
            if ($(this).val()) {
                $('#countrySelect').val('').trigger('change');
                fetchPackages({
                    region_id: $(this).val()
                }, '#packageSelect', '#packagesContainer');
            } else {
                $('#packagesContainer').hide();
            }
        });

        // =======================
        // Country/Region change (Edit)
        // =======================
        $('#editCountrySelect').change(function() {
            if ($(this).val()) {
                $('#editRegionSelect').val('').trigger('change');
                fetchPackages({
                    country_id: $(this).val()
                }, '#editPackageSelect', '#editPackagesContainer');
            } else {
                $('#editPackagesContainer').hide();
            }
        });

        $('#editRegionSelect').change(function() {
            if ($(this).val()) {
                $('#editCountrySelect').val('').trigger('change');
                fetchPackages({
                    region_id: $(this).val()
                }, '#editPackageSelect', '#editPackagesContainer');
            } else {
                $('#editPackagesContainer').hide();
            }
        });

        // =======================
        // Fetch Packages (works for Create & Edit)
        // =======================
        function fetchPackages(params, packageSelectId, containerId, selectedId = null) {
            $.ajax({
                url: "{{ route('admin.get.packages.ajax') }}",
                type: 'GET',
                data: params,
                success: function(packages) {
                    let $packageSelect = $(packageSelectId);
                    $packageSelect.empty().append('<option value="">Select Package</option>');

                    if (packages.length > 0) {
                        packages.forEach(pkg => {
                            let selected = selectedId && selectedId == pkg.id ? 'selected' : '';
                            $packageSelect.append(`<option value="${pkg.id}" ${selected}>${pkg.name}</option>`);
                        });
                        $(containerId).show();
                    } else {
                        $(containerId).hide();
                    }
                }
            });
        }

        // =======================
        // Banner date logic (From → To)
        // =======================
        $('#bannerFrom').on('change', function() {
            $('#bannerTo').attr('min', $(this).val());
        });

        $('#editBannerFrom').on('change', function() {
            $('#editBannerTo').attr('min', $(this).val());
        });

        $(document).on('change', '.banner-toggle', function() {
            let bannerId = $(this).data('id');
            let value = $(this).is(':checked') ? 1 : 0;

            $.ajax({
                url: "{{ route('admin.banners.status.update') }}",
                type: "POST",
                data: {
                    _token: "{{ csrf_token() }}",
                    id: bannerId,
                    value: value
                },
                success: function(response) {
                    toastr.success(response.message);
                },
                error: function(xhr) {
                    toastr.error("Something went wrong. Please try again.");
                }
            });
        });

    });
</script>

@endpush
@endsection
