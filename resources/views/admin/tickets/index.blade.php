@extends('layouts.app')

@section('content')
<div class="row">
    <div class="col-md-12">
        <div class="card">
            <div class="card-header">
                <h4 class="card-title">Support Tickets</h4>
            </div>
            <div class="card-body">
                {{-- Filter Form --}}
                <form method="GET" class="mb-3">
                    <div class="row">
                        <div class="col-md-3">
                            <input type="text" name="user_search" class="form-control w-auto" placeholder="Search User (name/email)" value="{{ request('user_search') }}">
                        </div>
                        <div class="col-md-3">
                            <select name="status" class="form-control">
                                <option value="">All Status</option>
                                <option value="open" {{ request('status') == 'open' ? 'selected' : '' }}>Open</option>
                                <option value="closed" {{ request('status') == 'closed' ? 'selected' : '' }}>Closed</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <input type="hidden" id="start_date" name="date_from" value="{{ request('date_from') }}">
                            <input type="hidden" id="end_date" name="date_to" value="{{ request('date_to') }}">
                            <div id="reportrange" style="background: #fff; cursor: pointer; padding: 5px 10px; border: 1px solid #ccc; width: 100%;">
                                <i class="fa fa-calendar"></i>&nbsp;
                                <span></span> <i class="fa fa-caret-down"></i>
                            </div>
                        </div>

                        <div class="col-md-3">
                            <button type="submit" class="btn btn-primary">Filter</button>
                            <a href="{{ route('admin.tickets.index') }}" class="btn btn-secondary">Reset</a>
                        </div>
                    </div>
                </form>

                <div class="table-responsive">
                    <table class="table table-striped table-hover">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>User</th>
                                <th>Subject</th>
                                <th>Created At</th>
                                <th>Status</th>
                                <th>Read/Unread</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($tickets as $i => $ticket)
                            <tr>
                                <td>{{ $tickets->firstItem() + $i }}</td>
                                <td>
                                    {{ $ticket->user->name ?? 'N/A' }}<br>
                                    <small>{{ $ticket->user->email ?? '' }}</small>
                                </td>
                                <td>{{ $ticket->subject }}</td>
                                <td>{{ $ticket->created_at->format('Y-m-d h:i A') }}</td>
                                <td>
                                    <select class="form-control ticket-toggle" data-id="{{ $ticket->id }}" data-field="status" id="">
                                        <option value="open" {{ $ticket->status == 'open' ? 'selected' : '' }}>Open</option>
                                        <option value="closed" {{ $ticket->status == 'closed' ? 'selected' : '' }}>Close</option>
                                    </select>
                                </td>
                                <td>
                                    <span class="badge badge-{{$ticket->unread_user_messages_count ? 'success':'warning'}}">{{$ticket->unread_user_messages_count ? 'Read':'Unread'}}</span>
                                </td>
                                <td>
                                    <a href="{{ route('admin.tickets.show', $ticket->id) }}" class="btn btn-sm btn-primary">View</a>
                                </td>
                            </tr>
                            @empty
                            <tr>
                                <td colspan="7" class="text-center">No tickets found.</td>
                            </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>

                <div class="d-flex justify-content-end mt-3">
                    {{ $tickets->withQueryString()->links() }}
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
    $(document).on('change', '.ticket-toggle', function() {
        let ticketId = $(this).data('id');
        let field = $(this).data('field');
        let value = $(this).val();

        $.ajax({
            url: "{{ route('admin.tickets.toggle') }}",
            type: "POST",
            data: {
                _token: "{{ csrf_token() }}",
                id: ticketId,
                field: field,
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
</script>
@endpush
