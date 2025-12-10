@extends('layouts.app')
@section('content')
<div class="row">
    <div class="col-md-12">
        <div class="card">
            <div class="card-header d-flex justify-content-between">
                <h4 class="card-title">Notifications</h4>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="display table table-striped table-hover">
                        <thead>
                            <tr>
                                <th>SN#</th>
                                <th>User</th>
                                <th>Title</th>
                                <th>Description</th>
                                <th>User Read</th>
                                <th>Admin Read</th>
                                <th>Created At</th>
                                <th>Updated At</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($notifications as $i => $notif)
                            <tr>
                                <td>{{ $i+1 }}</td>
                                <td>
                                    <div style="display: flex; align-items: center; gap: 10px;">
                                        <img src="{{ $notif->user->image ? asset($notif->user->image) : asset('assets/defaultProfile.png') }}"
                                            alt="Flag"
                                            style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
                                        <span>{{ $notif->user->name ?? $notif->user->email }}</span>
                                    </div>
                                </td>
                                <td>{{ $notif->title }}</td>
                                <td>{{ $notif->description }}</td>
                                <td>
                                    @if($notif->is_read)
                                    <span class="badge badge-success">Read</span>
                                    @else
                                    <span class="badge badge-warning">Unread</span>
                                    @endif
                                </td>
                                <td>
                                    @if($notif->is_admin_read)
                                    <span class="badge badge-success">Read</span>
                                    @else
                                    <span class="badge badge-warning">Unread</span>
                                    @endif
                                </td>
                                <td>{{ $notif->created_at->format('d M Y h:i A') }}</td>
                                <td>{{ $notif->updated_at->format('d M Y h:i A') }}</td>
                            </tr>
                            @empty
                            <tr>
                                <td colspan="8">No Notification found.</td>
                            </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
                <div class="float-end">
                    {{ $notifications->links() }}
                </div>
            </div>
        </div>
    </div>
</div>


@push('scripts')
<script>

</script>

@endpush
@endsection
