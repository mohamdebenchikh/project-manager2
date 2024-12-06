@component('mail::message')
# Team Invitation

You have been invited to join the team "{{ $invitation->team->name }}" as a {{ $invitation->role }}.

@component('mail::button', ['url' => route('team-invitations.accept', $invitation->token)])
Accept Invitation
@endcomponent

@component('mail::button', ['url' => route('team-invitations.decline', $invitation->token), 'color' => 'red'])
Decline
@endcomponent

This invitation will expire in 7 days.

Thanks,<br>
{{ config('app.name') }}
@endcomponent
