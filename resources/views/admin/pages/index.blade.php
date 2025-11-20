@extends('layouts.app')
@section('content')
<div class="row">
    <div class="col-md-12">
        <div class="card">
            <div class="card-header d-flex justify-content-between">
                <h4 class="card-title">Pages</h4>
                <a href="{{ route('admin.pages.create') }}" class="btn btn-primary btn-sm">Create Page</a>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table id="basic-datatables" class="display table table-striped table-hover">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Slug</th>
                                <th>Created At</th>
                                <th>Updated At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($pages as $page)
                            <tr>
                                <td>{{ $page->title }}</td>
                                <td>{{ $page->slug }}</td>
                                <td>{{ $page->created_at->format('d M Y h:i A') }}</td>
                                <td>{{ $page->updated_at->format('d M Y h:i A') }}</td>
                                <td>
                                    <a href="{{ route('admin.pages.edit', $page) }}" class="btn btn-sm btn-warning">Edit</a>
                                    <form action="{{ route('admin.pages.destroy', $page) }}" method="POST" class="d-inline">
                                        @csrf
                                        @method('DELETE')
                                        <button class="btn btn-sm btn-danger delete-btn">Delete</button>
                                    </form>
                                </td>
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
