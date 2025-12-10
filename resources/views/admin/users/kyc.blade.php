@extends('layouts.app')

@section('content')
<div class="row">
    <div class="col-md-12">
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h4 class="card-title">KYC List</h4>
            </div>

            <div class="card-body">
                <div class="table-responsive">
                    <table id="basic-datatables" class="display table table-striped table-hover">
                        <thead>
                            <tr>
                                <th>SN#</th>
                                <th>User Id</th>
                                <th>Name</th>
                                <th>Created At</th>
                                <th>Updated At</th>
                                <th>KYC Status</th>
                                <th>Identity Card No</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($kycs as $i => $kyc)
                            <tr>
                                <td>{{ $i + 1 }}</td>
                                <td><a href="{{route('admin.user.details',$kyc->user->id)}}">{{ $kyc->user->id }}</a></td>
                                <td>{{ $kyc->full_name }}</td>
                                <td>{{ $kyc->created_at->format('d M Y h:i A') }}</td>
                                <td>{{ $kyc->updated_at->format('d M Y h:i A') }}</td>
                                <td>
                                    @if($kyc->status == 'approved')
                                    <span class="badge bg-success">Approved</span>
                                    @elseif($kyc->status == 'rejected')
                                    <span class="badge bg-danger">Rejected</span>
                                    @else
                                    <span class="badge bg-warning">Pending</span>
                                    @endif
                                </td>
                                <td>{{ $kyc->identity_card_no }}</td>
                                <td>
                                    <button class="btn btn-info btn-sm viewKycBtn"
                                        data-bs-toggle="modal"
                                        data-bs-target="#kycModal"
                                        data-kyc='@json($kyc)'>
                                        View
                                    </button>
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

<!-- KYC Modal -->
<div class="modal fade" id="kycModal" tabindex="-1" aria-labelledby="kycModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <form id="kycActionForm" method="POST" action="{{route('admin.user.kyc.approval')}}">
            @csrf
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">KYC Details</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body row g-3">
                    <input type="hidden" name="kyc_id" id="kyc_id">
                    <div class="col-md-6">
                        <label class="form-label">Full Name</label>
                        <input type="text" id="kyc_full_name" class="form-control" disabled>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Date of Birth</label>
                        <input type="text" id="kyc_dob" class="form-control" disabled>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Identity Number</label>
                        <input type="text" id="kyc_identity_card_no" class="form-control" disabled>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Identity Card</label>
                        <img id="kyc_identity_card" src="" alt="Identity Card" class="img-thumbnail" style="max-width: 100px;">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Photo</label><br>
                        <img id="kyc_photo" src="" alt="Photo" class="img-thumbnail" style="max-width: 100px;">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Pancard</label><br>
                        <img id="kyc_pancard" src="" alt="Pancard" class="img-thumbnail" style="max-width: 100px;">
                    </div>
                </div>
                @if($status == 'pending')
                <div class="modal-footer">
                    <button type="submit" name="action" value="approved" class="btn btn-success">Approve</button>
                    <button type="submit" name="action" value="rejected" class="btn btn-danger">Reject</button>
                </div>
                @endif
            </div>
        </form>
    </div>
</div>
@endsection

@push('scripts')
<script>
    $(document).on('click', '.viewKycBtn', function(e) {
        const kyc = $(this).data('kyc');
        const baseUrl = "{{ asset('') }}"; // Laravel asset base path

        $('#kyc_id').val(kyc.id);
        $('#kyc_full_name').val(kyc.full_name);
        $('#kyc_dob').val(kyc.dob);
        $('#kyc_identity_card_no').val(kyc.identity_card_no);

        // Image paths (ensure these fields contain relative paths like 'uploads/kyc/photo.jpg')
        $('#kyc_identity_card').attr('src', baseUrl + kyc.identity_card);
        $('#kyc_photo').attr('src', baseUrl + kyc.photo);
        $('#kyc_pancard').attr('src', baseUrl + kyc.pancard);

        // Optional: clear images if path is null
        if (!kyc.identity_card) $('#kyc_identity_card').attr('src', '');
        if (!kyc.photo) $('#kyc_photo').attr('src', '');
        if (!kyc.pancard) $('#kyc_pancard').attr('src', '');
    });
</script>

@endpush
