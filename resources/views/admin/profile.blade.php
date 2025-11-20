@extends('layouts.app')
@section('content')

<div class="row">
    <div class="col-md-12">
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h4 class="card-title">Profile</h4>
            </div>
            <div class="card-body">
                <div class="row">
                    <!-- Profile Picture -->
                    <div class="col-md-4 text-center">
                        <img src="{{ auth()->user()->image ? asset(auth()->user()->image) : asset('assets/defaultProfile.png') }}"
                             alt="User Profile"
                             class="img-fluid rounded-circle shadow-sm"
                             style="width: 150px; height: 150px; object-fit: cover; border: 3px solid #6c757d;">

                        <h3 class="mt-3">{{ auth()->user()->name ?? 'N/A' }}</h3>
                        <p class="text-muted">{{ auth()->user()->email ?? 'N/A' }}</p>
                    </div>

                    <!-- Edit Form -->
                    <div class="col-md-8">
                        <form action="{{ route('admin.profile') }}" method="POST" enctype="multipart/form-data">
                            @csrf

                            <div class="row">
                                <div class="col-sm-6 mb-3">
                                    <label for="name">Name</label>
                                    <input type="text"
                                           class="form-control"
                                           name="name"
                                           value="{{ old('name', auth()->user()->name) }}" required>
                                </div>
                                <div class="col-sm-6 mb-3">
                                    <label for="email">Email</label>
                                    <input type="email"
                                           class="form-control"
                                           name="email"
                                           value="{{ old('email', auth()->user()->email) }}" required>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-sm-6 mb-3">
                                    <label for="password">New Password</label>
                                    <input type="password"
                                           class="form-control"
                                           name="password"
                                           placeholder="Leave blank if not changing">
                                </div>
                                <div class="col-sm-6 mb-3">
                                    <label for="password_confirmation">Confirm Password</label>
                                    <input type="password"
                                           class="form-control"
                                           name="password_confirmation"
                                           placeholder="Confirm new password">
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-sm-12 mb-3">
                                    <label for="image">Profile Image</label>
                                    <input type="file" class="form-control" name="image">
                                </div>
                            </div>

                            <button type="submit" class="btn btn-primary ">Update Profile</button>
                        </form>

                        <hr>
                        <div class="row mt-4">
                            <div class="col-12">
                                <p><strong>Last Updated:</strong> {{ auth()->user()->updated_at->format('M d, Y h:i A') }}</p>
                            </div>
                        </div>
                    </div>
                </div> <!-- end row -->
            </div>
        </div>
    </div>
</div>
@endsection
