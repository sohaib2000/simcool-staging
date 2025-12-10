<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PageController extends Controller
{
    public function index()
    {
        $pages = Page::latest()->get();
        return view('admin.pages.index', compact('pages'));
    }

    public function create()
    {
        return view('admin.pages.create');
    }

    public function store(Request $request)
    {
        // dd($request->all());
        // $request->validate([
        //     'title'             => 'required|max:255',
        //     'short_desc'        => 'required',
        //     'long_desc'         => 'required',
        //     'banner'             => 'nullable|image|max:2048',
        // ]);

        // $data = $request->except('banner', 'is_active');
        $data['is_active'] = $request->has('is_active');

        if ($request->hasFile('image')) {
            $data['banner'] = 'storage/'.$request->file('banner')->store('pages', 'public');
        }

        Page::create($data);

        return redirect()->route('admin.pages.index')->with('success', 'Page created successfully!');
    }

    public function edit(Page $page)
    {
        return view('admin.pages.edit', compact('page'));
    }

    public function update(Request $request, Page $page)
    {
        $request->validate([
            'title'             => 'required|max:255',
            'short_desc'        => 'nullable|string',
            'long_desc'         => 'nullable|string',
            'banner'             => 'nullable|image|max:2048',
        ]);

        $data = $request->except('banner', 'is_active');
        $data['is_active'] = 1;

        if ($request->hasFile('banner')) {
            if ($page->image) {
                Storage::disk('public')->delete($page->image);
            }
            $data['banner'] = 'storage/'.$request->file('banner')->store('pages', 'public');
        }

        $page->update($data);

        return redirect()->route('admin.pages.index')->with('success', 'Page updated successfully!');
    }

    public function destroy(Page $page)
    {
        if ($page->image) {
            Storage::disk('public')->delete($page->image);
        }
        $page->delete();

        return redirect()->route('admin.pages.index')->with('success', 'Page deleted successfully!');
    }
}
