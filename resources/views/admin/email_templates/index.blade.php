@extends('layouts.app')
@section('content')
<div class="row">
    <div class="col-md-12">
        <div class="card">
            <div class="card-header d-flex justify-content-between">
                <h4 class="card-title">Email Templates</h4>
                <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#createTemplateModal">
                    Create Template
                </button>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="display table table-striped table-hover">
                        <thead>
                            <tr>
                                <th>SN#</th>
                                <th>Name</th>
                                <th>Title</th>
                                <th>Created At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($templates as $i => $tpl)
                            <tr>
                                <td>{{ $i+1 }}</td>
                                <td>{{ $tpl->name }}</td>
                                <td>{{ $tpl->subject }}</td>
                                <td>{{ $tpl->created_at->format('d M Y h:i A') }}</td>
                                <td>
                                    <button class="btn btn-sm btn-warning edit-btn"
                                        data-id="{{ $tpl->id }}"
                                        data-name="{{ $tpl->name }}"
                                        data-subject="{{ $tpl->subject }}"
                                        data-description="{{ htmlentities($tpl->description) }}">
                                        Edit
                                    </button>
                                </td>
                            </tr>
                            @empty
                            <tr class="text-center">
                                <td colspan="5">No templates found.</td>
                            </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>

                <div class="flex justify-center mt-4 float-end">
                    {{ $templates->links() }}
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Create Modal -->
<div class="modal fade" id="createTemplateModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <form action="{{ route('admin.email-templates.store') }}" method="POST">
                @csrf
                <div class="modal-header">
                    <h5 class="modal-title">Create Email Template</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3"><label>Name</label><input type="text" name="name" class="form-control" required></div>
                    <div class="mb-3"><label>Subject</label><input type="text" name="subject" class="form-control" required></div>
                    <div class="mb-3"><label>Description</label><textarea name="description" class="form-control summernote" required></textarea></div>
                </div>
                <div class="modal-footer"><button type="submit" class="btn btn-primary">Create</button></div>
            </form>
        </div>
    </div>
</div>

<!-- Edit Modal -->
<div class="modal fade" id="editTemplateModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <form id="editTemplateForm" method="POST">
                @csrf @method('PUT')
                <div class="modal-header">
                    <h5 class="modal-title">Edit Email Template</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3"><label>Name</label><input type="text" name="name" id="editName" class="form-control" disabled required></div>
                    <div class="mb-3"><label>Subject</label><input type="text" name="subject" id="editTitle" class="form-control" required></div>
                    <div class="mb-3"><label>Description</label><textarea name="description" id="editDescription" class="form-control summernote" required></textarea></div>
                </div>
                <div class="modal-footer"><button type="submit" class="btn btn-primary">Update</button></div>
            </form>
        </div>
    </div>
</div>

@push('scripts')
<script>
    $('.edit-btn').on('click', function() {
        $('#editName').val($(this).data('name'));
        $('#editTitle').val($(this).data('subject'));

        // set HTML back into Summernote editor
        $('#editDescription').summernote('code', $(this).data('description'));

        $('#editTemplateForm').attr('action', '/admin/email-templates/' + $(this).data('id'));
        $('#editTemplateModal').modal('show');
    });
</script>
@endpush
@endsection
