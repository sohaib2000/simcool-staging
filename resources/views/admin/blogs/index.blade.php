@extends('layouts.app')
@section('content')
<div class="row">
    <div class="col-md-12">
        <div class="card">
            <div class="card-header">
                <div class="row">
                    <div class="col-md-6">
                        <h4 class="card-title">Blogs</h4>
                    </div>
                    <div class="col-md-6">
                        <a href="{{route('admin.blogs.create')}}" class="btn btn-primary pull-right btn-sm">Create Blog</a>
                    </div>
                </div>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="display table table-striped table-hover">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Published</th>
                                <th>Created At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($blogs as $blog)
                            <tr>
                                <td>{{ $blog->title }}</td>
                                <td>{{ $blog->is_published ? 'Yes' : 'No' }}</td>
                                <td>{{ $blog->created_at->format('d M Y') }}</td>
                                <td>
                                    <a href="{{ route('admin.blogs.edit', $blog) }}" class="btn btn-sm btn-warning">Edit</a>
                                    <form action="{{ route('admin.blogs.destroy', $blog) }}" method="POST" class="d-inline" onsubmit="return confirm('Delete this blog?')">
                                        @csrf
                                        @method('DELETE')
                                        <button class="btn btn-sm btn-danger">Delete</button>
                                    </form>
                                </td>
                            </tr>
                            @empty
                            <tr>
                                <td colspan="4">No blogs found.</td>
                            </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
            {{ $blogs->links() }}
        </div>
    </div>
</div>
@endsection
