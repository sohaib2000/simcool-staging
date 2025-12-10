@extends('layouts.app')
@section('content')
<div class="row">
    <div class="col-md-12">
        <div class="card">
            <div class="card-header d-flex justify-content-between">
                <h4 class="card-title">Notifications</h4>
                <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#createNotificationModal">
                    Create Notification
                </button>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table id="basic-datatables" class="display table table-striped table-hover">
                        <thead>
                            <tr>
                                <th>SN#</th>
                                <th>Title</th>
                                <th>Description</th>
                                <th>Image</th>
                                <th>Created At</th>
                                <th>Updated At</th>
                                <th>Send</th>
                                <th class="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($notifications as $i => $notification)
                            <tr>
                                <td>{{ $i+1 }}</td>
                                <td>{{ $notification->title }}</td>
                                <td>{{ $notification->description }}</td>
                                <td>
                                    @if($notification->image)
                                    <img src="{{asset($notification->image)}}" width="150" height="100" alt="Noti Image">
                                    @else
                                    ---
                                    @endif
                                </td>
                                <td>{{ $notification->created_at->format('d M Y h:i A') }}</td>
                                <td>{{ $notification->updated_at->format('d M Y h:i A') }}</td>
                                <td>
                                    <button class="btn btn-sm btn-primary send-btn"
                                        data-id="{{ $notification->id }}">
                                        Send
                                    </button>
                                </td>
                                <td>
                                    <div class="d-flex mx-3">
                                        <button class="btn btn-sm btn-warning edit-btn mx-2"
                                            data-id="{{ $notification->id }}"
                                            data-title="{{ $notification->title }}"
                                            data-description="{{ $notification->description }}"
                                            data-image="{{ $notification->image ? asset('storage/'.$notification->image) : '' }}">
                                            Edit
                                        </button>
                                        <form action="{{ route('admin.notification.master.delete', $notification) }}" method="POST" class="d-inline delete-form">
                                            @csrf
                                            @method('DELETE')
                                            <button type="button" class="btn btn-sm btn-danger btn-delete">Delete</button>
                                        </form>
                                    </div>
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

<!-- Create Modal -->

<div class="modal fade" id="createNotificationModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <form action="{{ route('admin.notification.master.store') }}" method="POST" enctype="multipart/form-data">
                @csrf
                <div class="modal-header">
                    <h5 class="modal-title">Create Notification</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">

                    <!-- Title -->
                    <div class="mb-3">
                        <label>Title</label>
                        <input type="text" name="title" class="form-control" required>
                    </div>

                    <!-- Description -->
                    <div class="mb-3">
                        <label>Description</label>
                        <textarea name="description" id="createDescription" class="form-control" rows="3"></textarea>
                    </div>

                    <!-- Image -->
                    <div class="mb-3">
                        <label>Image</label>
                        <input type="file" name="image" id="createImage" class="form-control" accept="image/*">
                        <div class="mt-2">
                            <img id="createImagePreview" src="" alt="Preview" class="img-thumbnail" style="max-height: 150px; display:none;">
                        </div>
                    </div>

                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="submit" class="btn btn-primary">Create</button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Edit Modal -->
<div class="modal fade" id="editNotificationModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <form id="editNotificationForm" method="POST" enctype="multipart/form-data">
                @csrf
                @method('POST')
                <div class="modal-header">
                    <h5 class="modal-title">Edit Notification</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">

                    <!-- Title -->
                    <div class="mb-3">
                        <label>Title</label>
                        <input type="text" name="title" id="editTitle" class="form-control" required>
                    </div>

                    <!-- Description -->
                    <div class="mb-3">
                        <label>Description</label>
                        <textarea name="description" id="editDescription" class="form-control" rows="3"></textarea>
                    </div>

                    <!-- Image -->
                    <div class="mb-3">
                        <label>Image</label>
                        <input type="file" name="image" id="editImage" class="form-control" accept="image/*">
                        <div class="mt-2">
                            <img id="editImagePreview" src="" alt="Preview" class="img-thumbnail" style="max-height: 150px; display:none;">
                        </div>
                    </div>

                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="submit" class="btn btn-primary">Update</button>
                </div>
            </form>
        </div>
    </div>
</div>

<div class="modal fade" id="sendNotificationModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <form id="sendNotificationForm" method="POST">
                @csrf
                @method('POST')
                <div class="modal-header">
                    <h5 class="modal-title">Send Notification</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">

                    <!-- Title -->
                    <div class="mb-3">
                        <label>Users</label>
                        <select name="userid" class="form-control select2" id="" required>
                            <option value="all">All Users</option>
                            @foreach($users as $user)
                            <option value="{{$user->id}}">{{$user->email}} ({{$user->name ?? 'N/A'}})</option>
                            @endforeach
                        </select>
                    </div>

                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="submit" class="btn btn-primary">Send</button>
                </div>
            </form>
        </div>
    </div>
</div>


@push('scripts')
<script>
    $(function() {
        // =======================
        // Edit button click handler
        // =======================
        $('.edit-btn').on('click', function() {
            let id = $(this).data('id');
            let title = $(this).data('title');
            let description = $(this).data('description');
            let image = $(this).data('image'); // 👈 add this in your button dataset later

            $('#editTitle').val(title);
            $('#editDescription').val(description);

            if (image) {
                $('#editImagePreview').attr('src', image).show();
            } else {
                $('#editImagePreview').hide();
            }

            $('#editNotificationForm').attr('action', '/admin/master-notifications/update/' + id);
            $('#editNotificationModal').modal('show');
        });

        // =======================
        // Send button
        // =======================
        $('.send-btn').on('click', function() {
            let id = $(this).data('id');
            $('#sendNotificationForm').attr('action', '/admin/master-notifications/send/' + id);
            $('#sendNotificationModal').modal('show');
        });

        // =======================
        // Preview selected image
        // =======================
        function readURL(input, previewId) {
            if (input.files && input.files[0]) {
                let reader = new FileReader();
                reader.onload = function(e) {
                    $(previewId).attr('src', e.target.result).show();
                }
                reader.readAsDataURL(input.files[0]);
            } else {
                $(previewId).hide();
            }
        }

        $('#createImage').change(function() {
            readURL(this, '#createImagePreview');
        });

        $('#editImage').change(function() {
            readURL(this, '#editImagePreview');
        });

        // =======================
        // Require either description OR image
        // =======================
        $('#createNotificationModal form, #editNotificationModal form').on('submit', function(e) {
            let description = $(this).find('textarea[name="description"]').val().trim();
            let image = $(this).find('input[name="image"]').val();

            if (description === "" && image === "") {
                e.preventDefault();
                toastr.error("Please enter a description or upload an image (at least one required).");
                return false;
            }
        });
    });
</script>
@endpush

@endsection
