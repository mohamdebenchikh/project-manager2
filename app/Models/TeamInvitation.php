<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TeamInvitation extends Model
{
    use HasFactory;

    protected $fillable = [
        'team_id',
        'email',
        'role',
        'token',
        'status',
        'expires_at',
        'invited_by',
        'reminder_count',
        'reminder_sent_at',
        'accepted_at'
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'reminder_sent_at' => 'datetime',
        'accepted_at' => 'datetime'
    ];

    protected $with = ['team', 'inviter'];

    public function inviter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'invited_by');
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    /**
     * Get the user being invited (if they exist in the system)
     */
    public function invitee()
    {
        return User::where('email', $this->email)->first();
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    public function canSendReminder(): bool
    {
        if ($this->reminder_count >= 3) {
            return false;
        }

        if ($this->reminder_sent_at && $this->reminder_sent_at->addDays(1)->isFuture()) {
            return false;
        }

        return true;
    }
}
