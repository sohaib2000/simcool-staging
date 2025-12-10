<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use App\Models\SupportTicket;
use App\Models\SupportTicketMessage;
use App\Models\UserNotification;
use Illuminate\Http\Request;
use Auth;

class SupportTicketApiController extends BaseController
{
    // List tickets for user
    public function index(Request $request)
    {
        try {
            $tickets = Auth::guard('api')->user()
                ->supportTickets()
                ->with('messages')
                ->paginate(15);

            return $this->sendResponse($tickets, 'Tickets fetched successfully.');
        } catch (\Exception $e) {
            return $this->sendError($e->getMessage());
        }
    }

    // Show single ticket
    public function show(SupportTicket $ticket)
    {
        try {
            $ticket->load('messages');

            return $this->sendResponse($ticket, 'Ticket details fetched successfully.');
        } catch (\Exception $e) {
            return $this->sendError($e->getMessage());
        }
    }

    // Create new ticket (only if no open)
    public function store(Request $request)
    {
        $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        try {
            $user = Auth::guard('api')->user();

            if (SupportTicket::where('user_id', $user->id)->where('status', 'open')->exists()) {
                return $this->sendError('You already have an open ticket.', 422);
            }

            $ticket = SupportTicket::create([
                'user_id' => $user->id,
                'subject' => $request->subject,
                'status' => 'open',
            ]);

            SupportTicketMessage::create([
                'support_ticket_id' => $ticket->id,
                'user_id' => $user->id,
                'message' => $request->message,
                'sender_type' => 'user',
                'is_read' => false,
            ]);

            UserNotification::create([
                'user_id' => $user->id,
                'title' => 'Ticket Message #' . $ticket->id,
                'type' => 9,
                'description' => 'New message from ' . $user->name ?? $user->email,
            ]);
            return $this->sendResponse($ticket->load('messages'), 'Ticket created successfully.', 201);
        } catch (\Exception $e) {
            return $this->sendError($e->getMessage());
        }
    }

    // Add message to ticket (only if admin replied last)
    public function addMessage(Request $request, SupportTicket $ticket)
    {
        $request->validate(['message' => 'required|string']);

        try {
            $user = Auth::guard('api')->user();
            $lastMessage = $ticket->messages()->latest()->first();

            // User can't send if last message was by user (no admin reply yet)
            if ($lastMessage && $lastMessage->sender_type === 'user') {
                return $this->sendError('Wait for admin reply before sending another message.', 422);
            }

            $message = SupportTicketMessage::create([
                'support_ticket_id' => $ticket->id,
                'user_id' => $user->id,
                'message' => $request->message,
                'sender_type' => 'user',
                'is_read' => false,
            ]);

            return $this->sendResponse($message, 'Message sent successfully.', 201);
        } catch (\Exception $e) {
            return $this->sendError($e->getMessage());
        }
    }

    public function faqs()
    {
        try {
            $faqs = Faq::latest()->where('is_active', 1)->get();
            return $this->sendResponse($faqs, 'FAQs fetched successfully.');
        } catch (\Exception $e) {
            return $this->sendError($e->getMessage());
        }
    }
}
