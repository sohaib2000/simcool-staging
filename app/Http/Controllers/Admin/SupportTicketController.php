<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use App\Models\SupportTicketMessage;
use App\Models\User;
use App\Notifications\SupportTicketNoti;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SupportTicketController extends Controller
{
    // List tickets with unread user messages flagged
    public function index(Request $request)
    {
        $query = SupportTicket::with('user')->withCount(['messages as unread_user_messages_count' => function ($q) {
            $q->where('sender_type', 'user')->where('is_read', false);
        }]);

        // Filter by user name/email
        if ($request->filled('user_search')) {
            $search = $request->user_search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by date range
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $tickets = $query->orderBy('created_at', 'desc')->paginate(15);

        return view('admin.tickets.index', compact('tickets'));
    }

    // Show ticket details and mark user messages as read
    public function show(SupportTicket $ticket)
    {
        SupportTicketMessage::where('support_ticket_id',$ticket->id)->where('sender_type', 'user')->where('is_read', false)->update(['is_read' => 1]);

        $ticket->load('messages.user');

        return view('admin.tickets.show', compact('ticket'));
    }

    // Admin reply to ticket
    public function reply(Request $request, SupportTicket $ticket)
    {
        $request->validate([
            'message' => 'required|string',
        ]);

        // Assuming admin user is authenticated
        $adminUser = Auth::user();

        // Create admin message
        SupportTicketMessage::create([
            'support_ticket_id' => $ticket->id,
            'user_id' => $adminUser->id,
            'message' => $request->message,
            'sender_type' => 'admin',
            'is_read' => false,
        ]);
        $user = User::find($ticket->user_id);
        $user->notify(new SupportTicketNoti($ticket->id));
        if ($ticket->status !== 'open') {
            $ticket->update(['status' => 'open']);
        }

        return redirect()->route('admin.tickets.show', $ticket)->with('success', 'Reply sent successfully.');
    }

    // Close the ticket
    public function close(SupportTicket $ticket)
    {
        $ticket->update(['status' => 'closed']);

        return redirect()->route('admin.tickets.index')->with('success', 'Ticket closed successfully.');
    }

    public function toggle(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:support_tickets,id',
            'field' => 'required|string|in:status',
            'value' => 'required|string',
        ]);

        $ticket = SupportTicket::findOrFail($request->id);

        $ticket->{$request->field} = $request->value;
        $ticket->save();

        return response()->json(['message' => 'Ticket updated successfully.']);
    }
}
