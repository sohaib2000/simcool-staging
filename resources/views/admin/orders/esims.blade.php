@extends('layouts.app')
@section('content')

<div class="row">
    <div class="col-md-12">
        <div class="card">
            <div class="card-header">
                <div class="row">
                    <div class="col-md-6">
                        <h4 class="card-title">Esims</h4>
                    </div>
                </div>
            </div>
            <div class="card-body">
                <div>
                    <form method="GET" class="mb-3 d-flex gap-2">
                        <select name="limit" class="form-control w-auto" onchange="this.form.submit()">
                            <option value="10" {{ $limit == 10 ? 'selected' : '' }}>10</option>
                            <option value="25" {{ $limit == 25 ? 'selected' : '' }}>25</option>
                            <option value="50" {{ $limit == 50 ? 'selected' : '' }}>50</option>
                        </select>
                        <input type="text" name="search" class="form-control w-auto"
                            placeholder="Search..." value="{{ $search ?? '' }}">
                    </form>

                </div>

                <div class="table-responsive">
                    <table class="display table table-striped table-hover">
                        <thead>
                            <tr>
                                <th>SN#</th>
                                <th>Status</th>
                                <th>Order</th>
                                <th>ICCID</th>
                                <th>Package</th>
                                <th>Activated At</th>
                                <th>Expired At</th>
								<th>Finished At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($esims as $i => $sim)
                            <tr>
                                <td>{{ $i + 1 }}</td>
                                <td>
                                    @if($sim->status == 'ACTIVE')
                                    <span class="badge badge-success">ACTIVE</span>
                                    @elseif($sim->status == 'NOT_ACTIVE')
                                    <span class="badge badge-warning">NOT ACTIVE</span>
                                    @elseif($sim->status == 'FINISHED')
                                    <span class="badge badge-danger">FINISHED</span>
                                    @elseif($sim->status == 'Refunded')
                                    <span class="badge badge-info">REFUNDED</span>
                                    @else
                                    <span class="badge badge-primary">{{$sim->status}}</span>
                                    @endif
                                </td>
                                <td><a href="{{route('admin.orders.details',$sim->order->id)}}">{{$sim->order->order_ref}}</a></td>

                                <td>{{$sim->iccid}}</td>
                                <td>{{ $sim->package->name }}</td>
                                <td>{{ $sim->activated_at ? date('d M Y h:i A',strtotime($sim->activated_at)) : '---' }}</td>
                                <td>{{ $sim->expired_at ? date('d M Y h:i A',strtotime($sim->expired_at)) : '---' }}</td>
                                <td>{{ $sim->finished_at ? date('d M Y h:i A',strtotime($sim->finished_at)) : '---' }}</td>
                              <td>
                                    <button type="button"
                                        class="btn btn-info btn-sm view-usage-btn"
                                        data-id="{{ $sim->id }}">
                                        View Usage
                                    </button>
                                </td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
                <div class="flex justify-center mt-4 float-end">
                    {{ $esims->links() }}
                </div>
            </div>
        </div>
    </div>
</div>
<div class="modal fade" id="usageModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Usage & Top-up History</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <div id="usageContent">
                    <p class="text-center text-muted">Loading...</p>
                </div>
            </div>
        </div>
    </div>
</div>
<script>
    document.querySelector('input[name="search"]').addEventListener('input', function() {
        this.form.submit();
    });
</script>

@endsection

@push('scripts')
<script>
    document.querySelectorAll('.view-usage-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            let id = this.getAttribute('data-id');
            let modal = new bootstrap.Modal(document.getElementById('usageModal'));
            document.getElementById('usageContent').innerHTML = "<p class='text-center text-muted'>Loading...</p>";
            modal.show();

            fetch(`/admin/esims/${id}/usage`)
                .then(res => res.json())
                .then(data => {
                    let usageHtml = `<h6>Usage</h6>`;

                    if (data.usage) {
                        let u = data.usage;
                        usageHtml += `<table class="table table-bordered">
                <thead>
                    <tr>
                        <th>Data Remaining (MB)</th>
                        <th>Voice</th>
                        <th>SMS</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${u.remaining ?? '---'}</td>
                        <td>${u.remaining_voice ?? '---'}</td>
                        <td>${u.remaining_text ?? '---'}</td>
                    </tr>
                </tbody>
            </table>`;
                    } else {
                        usageHtml += `<p class="text-muted">No usage found.</p>`;
                    }

                    document.getElementById('usageContent').innerHTML = usageHtml;
                })
                .catch(() => {
                    document.getElementById('usageContent').innerHTML = "<p class='text-danger'>Failed to load usage data.</p>";
                });

        });
    });
</script>


@endpush
