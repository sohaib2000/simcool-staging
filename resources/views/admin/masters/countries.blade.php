@extends('layouts.app')
@section('content')
<div class="row">
    <div class="col-md-12">
        <div class="card">
            <div class="card-header">
                <div class="row">
                    <div class="col-md-6">
                        <h4 class="card-title">Countries</h4>
                    </div>
                </div>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table id="basic-datatables" class="display table table-striped table-hover">
                        <thead>
                            <tr>
                                <th>ID#</th>
                                <th>Country</th>
                                <th>Slug</th>
                                <th>Country Code</th>
                                <th>Created At</th>
                                <th>Updated At</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($countries as $i => $country)
                            <tr>
                                <td>{{ $i + 1 }}</td>
                                <td>
                                    <div style="display: flex; align-items: center; gap: 10px;">
                                        <img src="{{$country->image ?? asset('assets/img/flags/'.strtolower($country->country_code).'.png')}}"
                                            alt="Flag"
                                            style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
                                        <span>{{ $country->name }}</span>
                                    </div>
                                </td>
                                <td>{{ $country->slug }}</td>
                                <td>{{ $country->country_code }}</td>
                                <td>{{ date('d M Y h:i A', strtotime($country->created_at)) }}</td>
                                <td>{{ date('d M Y h:i A', strtotime($country->updated_at)) }}</td>
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
