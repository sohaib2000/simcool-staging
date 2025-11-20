<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Illuminate\Http\Request;

class PageController extends Controller
{
    public function pages($slug)
    {
        try {
            $page = Page::where('slug', $slug)->firstOrFail();
            return view('frontend.pages.index',compact('page'));
        } catch (\Exception $th) {
             abort(404);
        }
    }
     public function contactUs(Request $request)
    {
        if($request->method() == 'POST')
        {
            return back()->with('success','Your query submitted successfully.');

        }
        return view('frontend.pages.contactus');

    }
}
