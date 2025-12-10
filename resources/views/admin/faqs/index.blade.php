@extends('layouts.app')
@section('content')
<div class="row">
    <div class="col-md-12">
        <div class="card">
            <div class="card-header d-flex justify-content-between">
                <h4 class="card-title">FAQs</h4>
                <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#createFaqModal">
                    Create FAQ
                </button>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table id="basic-datatables" class="display table table-striped table-hover">
                        <thead>
                            <tr>
                                <th>SN#</th>
                                <th>Question</th>
                                <th>Answer</th>
                                <th>Status</th>
                                <th>Created At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($faqs as $i => $faq)
                            <tr>
                                <td>{{ $i+1 }}</td>
                                <td>{{ $faq->question }}</td>
                                <td>{{ Str::limit($faq->answer, 80) }}</td>
                                  <td>
                                    <div class="form-check form-switch align-items-center justify-content-center">
                                        <input class="form-check-input faq-toggle custom-switch"
                                             data-id="{{ $faq->id }}"
                                            {{ $faq->is_active ? 'checked' : '' }}
                                            type="checkbox" role="switch">
                                    </div>
                                </td>
                                <td>{{ $faq->created_at->format('d M Y h:i A') }}</td>
                                <td>
                                    <button class="btn btn-sm btn-warning edit-btn"
                                        data-id="{{ $faq->id }}"
                                        data-question="{{ $faq->question }}"
                                        data-answer="{{ $faq->answer }}"
                                        data-active="{{ $faq->is_active }}">
                                        Edit
                                    </button>
                                    <form action="{{ route('admin.faqs.destroy', $faq) }}" method="POST" class="d-inline delete-form">
                                        @csrf
                                        @method('DELETE')
                                        <button type="button" class="btn btn-sm btn-danger btn-delete">Delete</button>
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

<!-- Create Modal -->
<div class="modal fade" id="createFaqModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <form action="{{ route('admin.faqs.store') }}" method="POST">
                @csrf
                <div class="modal-header">
                    <h5 class="modal-title">Create FAQ</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label>Question</label>
                        <input type="text" name="question" class="form-control" required>
                    </div>
                    <div class="mb-3">
                        <label>Answer</label>
                        <textarea name="answer" class="form-control" rows="3" required></textarea>
                    </div>
                    <div class="form-check">
                        <input type="checkbox" class="form-check-input" name="is_active" value="1">
                        <label class="form-check-label">Active</label>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="submit" class="btn btn-primary">Create</button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Edit Modal -->
<div class="modal fade" id="editFaqModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <form id="editFaqForm" method="POST">
                @csrf @method('PUT')
                <div class="modal-header">
                    <h5 class="modal-title">Edit FAQ</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label>Question</label>
                        <input type="text" name="question" id="editQuestion" class="form-control" required>
                    </div>
                    <div class="mb-3">
                        <label>Answer</label>
                        <textarea name="answer" id="editAnswer" class="form-control" rows="3" required></textarea>
                    </div>
                    <div class="form-check">
                        <input type="checkbox" class="form-check-input" name="is_active" id="editIsActive" value="1">
                        <label class="form-check-label">Active</label>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="submit" class="btn btn-primary">Update</button>
                </div>
            </form>
        </div>
    </div>
</div>

@push('scripts')
<script>
    $(function() {
        // toggle status
        $(document).on('change', '.faq-toggle', function() {
            let id = $(this).data('id');
            let value = $(this).is(':checked') ? 1 : 0;
            $.post("{{ route('admin.faqs.status.update') }}", {
                _token: "{{ csrf_token() }}",
                id: id,
                value: value
            }, function(resp) {
                toastr.success(resp.message);
            }).fail(function() {
                toastr.error("Failed to update status");
            });
        });

        // edit button
        $('.edit-btn').on('click', function() {
            let id = $(this).data('id');
            $('#editQuestion').val($(this).data('question'));
            $('#editAnswer').val($(this).data('answer'));
            $('#editIsActive').prop('checked', $(this).data('active') == 1);
            $('#editFaqForm').attr('action', '/admin/faqs/' + id);
            $('#editFaqModal').modal('show');
        });
    });
</script>
@endpush
@endsection
