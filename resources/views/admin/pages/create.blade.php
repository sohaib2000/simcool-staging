@extends('layouts.app')
@section('content')
<div class="row">
    <div class="col-md-12">
        <div class="card">
            <div class="card-header">
                <div class="row">
                    <div class="col-md-6">
                        <h4 class="card-title">Create Page</h4>
                    </div>
                </div>
            </div>
            <div class="card-body">
                <form method="POST" action="{{ route('admin.pages.store') }}" enctype="multipart/form-data">
                    @csrf
                    @include('admin.pages.form')
                    <button type="submit" class="btn btn-success">Save Page</button>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection
