@extends('layouts.app')
@section('content')
<div class="row">
    <div class="col-md-12">
        <div class="card">
            <div class="card-header">
                <div class="row">
                    <div class="col-md-6">
                        <h4 class="card-title">Operators</h4>
                    </div>
                </div>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table id="basic-datatables" class="display table table-striped table-hover">
                        <thead>
                            <tr>
                                <th>ID#</th>
                                <th>Name</th>
                                <th>ESim Type</th>
                                <th>APN Type</th>
                                <th>APN Value</th>
                                <th>Info</th>
                                <th>Plan Type</th>
                                <th>Rechargeability</th>
                                <th>Created At</th>
                                <th>Updated At</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($operators as $i => $operator)
                            <tr>
                                <td>{{ $i + 1 }}</td>
                                <td>
                                    <div style="display: flex; align-items: center; gap: 10px;">
                                        <img src="{{ asset($operator->image ?? '') }}"
                                            alt="Flag"
                                            style="width: 65px; height: 45px; object-fit: cover;">
                                        <span>{{ $operator->name }}</span>
                                    </div>
                                </td>
                                <td>{{ $operator->esim_type }}</td>
                                <td>{{ $operator->apn_type }}</td>
                                <td>{{ $operator->apn_value }}</td>
                                <td>{{ $operator->info ?? '---' }}</td>
                                <td>{{ $operator->plan_type }}</td>
                                <td>{{ $operator->rechargeability == 1 ? 'Yes' : 'No' }}</td>
                                <td>{{ date('d M Y h:i A', strtotime($operator->created_at)) }}</td>
                                <td>{{ date('d M Y h:i A', strtotime($operator->updated_at)) }}</td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>

                </div>
            </div>
        </div>
    </div>
</div>

@endsection
