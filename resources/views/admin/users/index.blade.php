@extends('layouts.app')

@section('content')

<div class="row">
    <div class="col-md-12">
        <div class="card">
            <div class="card-header">
                <div class="row">
                    <div class="col-md-6">
                        <h4 class="card-title">Users</h4>
                    </div>
                    <div class="col-md-6 text-end">
                        <form method="GET" action="{{ route('admin.user.index') }}" class="d-flex gap-2">
                            <input type="text" name="search" class="form-control"
                                placeholder="Search name or email" value="{{ request('search') }}">

                            <select name="status" class="form-select">
                                <option value="">All Status</option>
                                <option value="active" {{ request('status')=='active' ? 'selected' : '' }}>Active</option>
                                <option value="inactive" {{ request('status')=='inactive' ? 'selected' : '' }}>Inactive</option>
                                <option value="deleted" {{ request('status')=='deleted' ? 'selected' : '' }}>Deleted</option>
                            </select>

                            <select name="kyc_status" class="form-select">
                                <option value="">All KYC</option>
                                <option value="approved" {{ request('kyc_status')=='approved' ? 'selected' : '' }}>Approved</option>
                                <option value="pending" {{ request('kyc_status')=='pending' ? 'selected' : '' }}>Pending</option>
                            </select>

                            <button type="submit" class="btn btn-sm btn-primary">Filter</button>
                        </form>
                    </div>
                </div>
            </div>
            <div class="card-body">
                <div class="row">

                </div>
                <div class="table-responsive">
                    <table class="display table table-striped table-hover">
                        <thead>
                            <tr>
                                <th>SN#</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Created At</th>
                                <th>Status</th>
                                <th>Kyc Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($users as $i => $user)
                            <tr>
                                <td>{{$i+1}}</td>
                                <td>{{$user->name}}</td>
                                <td>{{$user->email}}</td>
                                <td>{{date('d M Y h:i A',strtotime($user->created_at))}}</td>
                                <td>
                                    @if($user->deleted_at != null)
                                    <span class="badge badge-danger">Deleted</span>
                                    @else
                                    <span class="badge badge-{{$user->is_active == 1 ? 'success' : 'danger'}}">{{$user->is_active == 1 ? 'Active' : 'Inactive'}}</span>
                                    @endif
                                </td>
                                <td>
                                    <span class="badge badge-{{$user->hasCompletedKyc() == true ? 'success' : 'danger'}}">{{$user->hasCompletedKyc() == true ? 'Approved' : 'Pending'}}</span>
                                </td>
                                <td>
                                    <a href="{{route('admin.user.details',$user->id)}}" class="badge badge-warning text-white"><i class="fas fa-eye"></i></a>
                                </td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
                <div class="flex justify-center mt-4 float-end">
                    {{ $users->links() }}
                </div>
            </div>
        </div>
    </div>
</div>

@push('scripts')
{{-- <script>
    $('#walletAmountForm').on('submit', function(e) {
        e.preventDefault();

        $.ajax({
            url: $(this).attr('action'),
            method: 'POST',
            data: $(this).serialize(),
            success: function(response) {
                $('#addWalletAmountModal').modal('hide');
                toastr.success('Amount added successfully!');
            },
            error: function(xhr) {
                toastr.error('Error adding amount');
            }
        });
    });
</script> --}}

@endpush
@endsection
