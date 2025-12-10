<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\User;
use App\Models\UserNotification;
use App\Notifications\AdminSendNoti;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class NotificationController extends Controller
{
    public function index()
    {
        try {
            $notifications = UserNotification::latest()->paginate(15);
            UserNotification::query()->update(['is_admin_read' => 1]);
            return view('admin.notifications.index', compact('notifications'));
        } catch (\Exception $th) {
            return back('error', $th->getMessage());
        }
    }
    public function readUpdate(Request $request)
    {
        try {
            UserNotification::latest()->take(4)->update(['is_admin_read' => 1]);
            return response()->json(['success' => true, 'message' => 'Update Successfully']);
        } catch (\Exception $th) {
            return response()->json(['success' => false, 'message' => $th->getMessage()]);
        }
    }


    // Show all notifications
    public function masterNotification()
    {
        $users = User::where('is_active', 1)->whereNot('role', 'admin')->get();
        $notifications = Notification::latest()->paginate(10);
        return view('admin.notifications.master-notification', compact('notifications', 'users'));
    }

    // Store notification
    public function store(Request $request)
    {
        $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'image'       => 'nullable|image|mimes:jpeg,png,jpg|max:1024',
        ]);

        try {
            $imagePath = null;
            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('uploads/notification', 'public');
            }
            Notification::create([
                'title' => $request->title,
                'description' => $request->description,
                'image' => !empty($imagePath) ? 'storage/'.$imagePath:null,
            ]);
            return back()->with('success', 'Notification created successfully!');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to create notification. ' . $e->getMessage());
        }
    }

    // Update notification
    public function update(Request $request, $id)
    {
        $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);
        try {
            $notification = Notification::find($id);
            if ($request->hasFile('image')) {
                // Delete old image if exists
                if ($notification->image && Storage::disk('public')->exists($notification->image)) {
                    Storage::disk('public')->delete($notification->image);
                }
                $notification->image = 'storage/' . $request->file('image')->store('uploads/notification', 'public');
            }
            $notification->title = $request->title;
            $notification->description = $request->description;
            $notification->save();
            return back()->with('success', 'Notification updated successfully!');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to update notification. ' . $e->getMessage());
        }
    }

    // Delete notification
    public function destroy(Notification $notification)
    {
        try {
            $notification->delete();
            return back()->with('success', 'Notification deleted successfully!');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to delete notification. ' . $e->getMessage());
        }
    }
    public function sendNotification(Request $request, $id)
    {
        try {
            $noti = Notification::find($id);
            if ($request->userid == 'all') {
                $users = User::where('is_active', 1)->get();
                foreach ($users as $user) {
                    $user->notify(new AdminSendNoti($noti->title, $noti->description,$noti->image));
                }
            } else {
                $user = User::find($request->userid);
                $user->notify(new AdminSendNoti($noti->title, $noti->description,$noti->image));
            }
            return back()->with('success', 'Notification sent successfully!');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to send notification. ' . $e->getMessage());
        }
    }
}
