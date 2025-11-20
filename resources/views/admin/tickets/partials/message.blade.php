<div class="mb-3">
    <strong>
        @if($message->sender_type == 'admin')
        Admin
        @else
        {{ $message->user->name ?? 'User' }}
        @endif
    </strong>
    <small class="text-muted"> - {{ $message->created_at->format('d M Y h:i A') }}</small>
    <p style="white-space: pre-line;">{{ $message->message }}</p>
    <hr>
</div>
