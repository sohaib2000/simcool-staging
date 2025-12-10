@extends('layouts.app')
@section('content')

<div class="row">
    <div class="col-md-12">
        <div class="card">
            <div class="card-header">
                <div class="row">
                    <div class="col-md-6">
                        <h4 class="card-title">Edit Blog</h4>
                    </div>
                </div>
            </div>
            <div class="card-body">
                <form method="POST" action="{{ route('admin.blogs.update', $blog) }}" enctype="multipart/form-data">
                    @csrf
                    @method('PUT')
                    @include('admin.blogs._form', ['blog' => $blog])
                    <button type="submit" class="btn btn-primary">Update Blog</button>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection
