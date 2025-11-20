@extends('layouts.app')
@section('content')
<div class="row">
    <div class="col-md-12">
        <div class="card">
            <div class="card-header">
                <div class="row">
                    <div class="col-md-6">
                        <h4 class="card-title">Regions</h4>
                    </div>
                </div>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table id="basic-datatables" class="display table table-striped table-hover">
                        <thead>
                            <tr>
                                <th>ID#</th>
                                <th>Region</th>
                                <th>Slug</th>
                                <th>Created At</th>
                                <th>Updated At</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($regions as $i => $region)
                            <tr>
                                <td>{{ $i + 1 }}</td>
                                <td>
                                    <div style="display: flex; align-items: center; gap: 10px;">
                                        <img src="{{ asset($region->image ?? '') }}"
                                            alt="Flag"
                                            style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
                                        <span>{{ $region->name }}</span>
                                    </div>
                                </td>
                                <td>{{ $region->slug }}</td>
                                <td>{{ date('d M Y h:i A', strtotime($region->created_at)) }}</td>
                                <td>{{ date('d M Y h:i A', strtotime($region->updated_at)) }}</td>
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
