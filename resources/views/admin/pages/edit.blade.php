@extends('layouts.app')
@section('content')
<div class="row">
    <div class="col-md-12">
        <div class="card">
            <div class="card-header">
                <div class="row">
                    <div class="col-md-6">
                        <h4 class="card-title">Edit Page</h4>
                    </div>
                </div>
            </div>
            <div class="card-body">
                <form method="POST" action="{{ route('admin.pages.update',$page) }}" enctype="multipart/form-data">
                    @csrf
                    @method('PUT')
                    @include('admin.pages.form')
                    <button type="submit" class="btn btn-primary">Update Page</button>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection
