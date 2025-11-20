<div class="mb-3">
    <label>Title</label>
    <input type="text" name="title" class="form-control" value="{{ old('title', $page->title ?? '') }}" required>
</div>

<div class="mb-3">
    <label>Short Description</label>
    <textarea name="short_desc" class="form-control summernote">{{ old('short_desc', $page->short_desc ?? '') }}</textarea>
</div>

<div class="mb-3">
    <label>Long Description</label>
    <textarea name="long_desc" class="form-control summernote" rows="6">{{ old('long_desc', $page->long_desc ?? '') }}</textarea>
</div>

<div class="mb-3">
    <label>Image</label>
    <input type="file" name="banner" class="form-control">
    @if(isset($page) && $page->banner)
        <img src="{{ asset($page->banner) }}" class="mt-2" width="120">
    @endif
</div>

<hr>
<h5>Meta Information (SEO)</h5>

<div class="mb-3">
    <label>Meta Title</label>
    <input type="text" name="meta_title" id="meta_title" class="form-control" value="{{ old('meta_title', $page->meta_title ?? '') }}">
</div>

<div class="mb-3">
    <label>Meta Description</label>
    <textarea name="meta_description" class="form-control">{{ old('meta_description', $page->meta_description ?? '') }}</textarea>
</div>

<div class="mb-3">
    <label>Meta Keywords</label>
    <textarea name="meta_keywords" class="form-control">{{ old('meta_keywords', $page->meta_keywords ?? '') }}</textarea>
</div>
