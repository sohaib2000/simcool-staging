<div class="mb-3">
    <label>Title</label>
    <input type="text" name="title" class="form-control" value="{{ old('title', $blog->title ?? '') }}" required>
</div>

<div class="mb-3">
    <label>Short Description</label>
    <textarea name="short_description" class="form-control summernote" required>{{ old('short_description', $blog->short_description ?? '') }}</textarea>
</div>

<div class="mb-3">
    <label>Long Description</label>
    <textarea name="long_description" class="form-control summernote" rows="6" required>{{ old('long_description', $blog->long_description ?? '') }}</textarea>
</div>

<div class="mb-3">
    <label>Image</label>
    <input type="file" name="image" class="form-control">
    @if(isset($blog) && $blog->image)
    <img src="{{ asset('storage/' . $blog->image) }}" class="mt-2" width="120">
    @endif
</div>

<div class="form-check mb-3">
    <input type="checkbox" name="is_published" class="form-check-input"
        {{ old('is_published', $blog->is_published ?? false) ? 'checked' : '' }}>
    <label class="form-check-label">Published</label>
</div>

<hr>

<h5>Meta Information (SEO)</h5>

<div class="mb-3">
    <label>Meta Title</label>
    <input type="text" name="meta_title" class="form-control" value="{{ old('meta_title', $blog->meta_title ?? '') }}">
</div>

<div class="mb-3">
    <label>Meta Description</label>
    <textarea name="meta_description" class="form-control">{{ old('meta_description', $blog->meta_description ?? '') }}</textarea>
</div>

<div class="mb-3">
    <label>Meta Keywords</label>
    <textarea name="meta_keywords" class="form-control">{{ old('meta_keywords', $blog->meta_keywords ?? '') }}</textarea>
</div>

@section('scripts')


@endsection
