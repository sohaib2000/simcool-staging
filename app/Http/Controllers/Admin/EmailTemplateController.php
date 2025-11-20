<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EmailTemplate;
use Illuminate\Http\Request;
use Exception;

class EmailTemplateController extends Controller
{
    public function index()
    {
        $templates = EmailTemplate::latest()->paginate(10);
        return view('admin.email_templates.index', compact('templates'));
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'name'        => 'required|string|max:255|unique:email_templates,name',
                'subject'     => 'required|string|max:255',
                'description' => 'required|string',
            ]);

            EmailTemplate::create($request->only('name', 'subject', 'description'));

            return back()->with('success', 'Email Template created successfully');
        } catch (Exception $e) {
            return back()->with('error', 'Failed to create email template: ' . $e->getMessage());
        }
    }

    public function update(Request $request, EmailTemplate $emailTemplate)
    {
        try {
            $request->validate([
                'subject'     => 'required|string|max:255',
                'description' => 'required|string',
            ]);

            $emailTemplate->update($request->only('name', 'subject', 'description'));

            return back()->with('success', 'Email Template updated successfully');
        } catch (Exception $e) {
            return back()->with('error', 'Failed to update email template: ' . $e->getMessage());
        }
    }

    public function destroy(EmailTemplate $emailTemplate)
    {
        try {
            $emailTemplate->delete();
            return back()->with('success', 'Email Template deleted successfully');
        } catch (Exception $e) {
            return back()->with('error', 'Failed to delete email template: ' . $e->getMessage());
        }
    }
}
