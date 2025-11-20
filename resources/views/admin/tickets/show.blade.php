@extends('layouts.app')

@section('content')
<div class="row">
    <div class="col-md-12">
        <a href="{{ route('admin.tickets.index') }}" class="btn btn-secondary mb-3">Back to Tickets</a>

        <div class="card">
            <div class="card-header">
                <h4 class="card-title">Ticket #{{ $ticket->id }} - {{ $ticket->subject }}</h4>
                <p><strong>User:</strong> {{ $ticket->user->name ?? 'N/A' }} ({{ $ticket->user->email ?? '' }})</p>
                <p><strong>Status:</strong>
                    <span class="badge bg-{{ $ticket->status == 'open' ? 'success' : 'secondary' }}">
                        {{ ucfirst($ticket->status) }}
                    </span>
                </p>
                <p><strong>Created At:</strong> {{ $ticket->created_at->format('d M Y h:i A') }}</p>
            </div>

            <div class="card-body">
                {{-- Messages --}}
                <div id="chat-box"
                     class="p-3 bg-light rounded"
                     style="max-height: 400px; overflow-y: auto; border: 1px solid #ddd;">

                    @foreach($ticket->messages()->with('user')->orderBy('created_at')->get() as $message)
                        <div class="d-flex mb-4
                            @if($message->sender_type == 'admin') justify-content-end @else justify-content-start @endif">

                            {{-- Profile Image --}}
                            @if($message->sender_type != 'admin')
                                <img src="{{ $message->user->image ? asset($message->user->image) : asset('assets/defaultProfile.png') }}"
                                     class="rounded-circle me-2" width="40" height="40" alt="User">
                            @endif

                            <div class="p-3 rounded-3 shadow-sm
                                @if($message->sender_type == 'admin') bg-primary text-white @else bg-white border @endif"
                                style="max-width: 70%;">

                                <strong class="d-block mb-1">
                                    @if($message->sender_type == 'admin')
                                        <img src="{{ auth()->user()->image ? asset(auth()->user()->image) : asset('assets/defaultProfile.png') }}"
                                             class="rounded-circle me-2" width="20" height="20" alt="Admin">
                                        Admin
                                    @else
                                        {{ $message->user->name ?? 'User' }}
                                    @endif
                                </strong>

                                <p class="mb-2" style="white-space: pre-line;">{{ $message->message }}</p>

                                <small class="text-muted d-block text-end">
                                    {{ $message->created_at->format('d M Y h:i A') }}
                                </small>
                            </div>

                            {{-- Admin Profile Image (on right side) --}}
                            @if($message->sender_type == 'admin')
                                <img src="{{ auth()->user()->image ? asset(auth()->user()->image) : asset('assets/defaultProfile.png') }}"
                                     class="rounded-circle ms-2" width="40" height="40" alt="Admin">
                            @endif
                        </div>
                    @endforeach
                </div>

                {{-- Reply Form --}}
                @if($ticket->status == 'open')
                    <form method="POST" action="{{ route('admin.tickets.reply', $ticket->id) }}" class="mt-3">
                        @csrf
                        <div class="mb-3">
                            <textarea name="message" id="message"
                                      class="form-control @error('message') is-invalid @enderror"
                                      rows="3" placeholder="Type your reply..." required>{{ old('message') }}</textarea>
                            @error('message')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                        <button type="submit" class="btn btn-primary float-end">
                            <i class="bi bi-send"></i> Send
                        </button>
                    </form>
                @else
                    <div class="alert alert-info mt-3">This ticket is closed. No further replies are allowed.</div>
                @endif
            </div>
        </div>
    </div>
</div>
@endsection
