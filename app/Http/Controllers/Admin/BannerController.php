<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Banner;
use App\Models\Country;
use App\Models\Region;
use Illuminate\Support\Facades\Storage;

class BannerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $banners = Banner::latest()->paginate(15);
            $countries = Country::get();
            $regions = Region::get();
            return view('admin.banners.index', compact('banners', 'regions', 'countries'));
        } catch (\Exception $th) {
            return back()->with('error', $th->getMessage());
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'name'      => 'required|string|max:255',
                'image'     => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
                'is_active' => 'nullable|boolean',
                'package_id' => 'nullable|numeric|exists:esim_packages,id',
                'banner_from' => 'required|date',
                'banner_to' => 'required|date',
            ]);

            $imagePath = null;
            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('uploads/banners', 'public');
            }

            Banner::create([
                'name'      => $request->name,
                'image'     => 'storage/' . $imagePath,
                'package_id'     => $request->package_id,
                'banner_from'     => $request->banner_from,
                'banner_to'     => $request->banner_to,
                'is_active' => $request->is_active ?? 0,
            ]);

            return redirect()->route('admin.banners.index')->with('success', 'Banner created successfully.');
        } catch (\Exception $th) {
            return back()->with('error', $th->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $banner = Banner::findOrFail($id);
        return view('admin.banners.show', compact('banner'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $banner = Banner::findOrFail($id);
        return view('admin.banners.edit', compact('banner'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            $request->validate([
                'name'      => 'required|string|max:255',
                'image'     => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'is_active' => 'nullable|boolean',
                'package_id' => 'nullable|numeric|exists:esim_packages,id',
                'banner_from' => 'required|date',
                'banner_to' => 'required|date',
            ]);

            $banner = Banner::findOrFail($id);

            if ($request->hasFile('image')) {
                // Delete old image if exists
                if ($banner->image && Storage::disk('public')->exists($banner->image)) {
                    Storage::disk('public')->delete($banner->image);
                }
                $banner->image = 'storage/' . $request->file('image')->store('uploads/banners', 'public');
            }

            $banner->name      = $request->name;
            $banner->is_active = $request->is_active ?? 0;
            $banner->package_id = $request->package_id;
            $banner->banner_from = $request->banner_from;
            $banner->banner_to = $request->banner_to;
            $banner->save();

            return redirect()->route('admin.banners.index')->with('success', 'Banner updated successfully.');
        } catch (\Exception $th) {
            return back()->with('error', $th->getMessage());
        }
    }

    public function destroy(string $id)
    {
        try {
            $banner = Banner::findOrFail($id);

            if ($banner->image && Storage::disk('public')->exists($banner->image)) {
                Storage::disk('public')->delete($banner->image);
            }

            $banner->delete();

            return redirect()->route('admin.banners.index')->with('success', 'Banner deleted successfully.');
        } catch (\Exception $th) {
            return back()->with('error', $th->getMessage());
        }
    }

    public function statusUpdate(Request $request)
    {
        try {
            $package = Banner::findOrFail($request->id);
            $package->is_active = $request->value;
            $package->save();

            return response()->json(['success' => true, 'message' =>'Updated successfully.']);
        } catch (\Exception $th) {
            return response()->json([
                'success' => false,
                'message' => $th->getMessage(),
            ]);
        }
    }
}
