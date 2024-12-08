@component('mail::message')
# {{ $isReminder ? 'Reminder: ' : '' }}Team Invitation

{{ $isReminder ? 'This is a reminder that you' : 'You' }} have been invited by {{ $inviter?->name ?? 'a team administrator' }} to join the team "{{ $team?->name ?? 'the team' }}".

@if($team?->description)
**Team Description:**
{{ $team->description }}
@endif

**Your Role:** {{ ucfirst($invitation->role) }}

This invitation will expire in {{ $expiresIn }} days.

@component('mail::button', ['url' => $acceptUrl])
Accept Invitation
@endcomponent

@component('mail::button', ['url' => $declineUrl, 'color' => 'red'])
Decline Invitation
@endcomponent

If you did not expect this invitation, you can safely ignore this email.

Thanks,<br>
{{ config('app.name') }}

<small>If you're having trouble clicking the buttons, copy and paste these URLs into your web browser:</small>

<small>Accept: {{ $acceptUrl }}</small>
<small>Decline: {{ $declineUrl }}</small>
@endcomponent
