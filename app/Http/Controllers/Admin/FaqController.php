<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use Illuminate\Http\Request;

class FaqController extends Controller
{
    public function index()
    {
        try {
            $faqs = Faq::latest()->get();
            return view('admin.faqs.index', compact('faqs'));
        } catch (\Exception $th) {
            return back()->with('error', $th->getMessage());
        }
    }

    public function store(Request $request)
    {
        $request->validate([
            'question' => 'required|string|max:255',
            'answer'   => 'required|string',
        ]);
        try {
            Faq::create([
                'question'  => $request->question,
                'answer'    => $request->answer,
                'is_active' => $request->is_active ? 1 : 0,
            ]);

            return back()->with('success', 'FAQ created successfully');
        } catch (\Exception $th) {
            return back()->with('error', $th->getMessage());
        }
    }

    public function update(Request $request, Faq $faq)
    {
        $request->validate([
            'question' => 'required|string|max:255',
            'answer'   => 'required|string',
        ]);
        try {
            $faq->update([
                'question'  => $request->question,
                'answer'    => $request->answer,
                'is_active' => $request->is_active ? 1 : 0,
            ]);

            return back()->with('success', 'FAQ updated successfully');
        } catch (\Exception $th) {
            return back()->with('error', $th->getMessage());
        }
    }

    public function destroy(Faq $faq)
    {
        try {
            $faq->delete();
            return back()->with('success', 'FAQ deleted successfully');
        } catch (\Exception $th) {
            return back()->with('error', $th->getMessage());
        }
    }

    public function statusUpdate(Request $request)
    {
        try {
            $faq = Faq::findOrFail($request->id);
            $faq->is_active = $request->value;
            $faq->save();
            return response()->json(['message' => 'Status updated successfully']);
        } catch (\Exception $th) {
            return response()->json(['message' => $th->getMessage()]);
        }
    }
}
