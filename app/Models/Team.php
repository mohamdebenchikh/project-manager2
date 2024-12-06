<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Project;
use App\Models\Task;
use App\Models\TeamInvitation;

class Team extends Model
{
    use HasFactory;

    protected $table = 'teams';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'description',
        'owner_id',
    ];

    protected $casts = [
        'active' => 'boolean',
        'personal_team' => 'boolean'
    ];

    protected static function booted()
    {
        static::created(function ($team) {
            // Add owner as team member with admin role
            $team->members()->attach($team->owner_id, [
                'role' => 'admin',
            ]);
        });

        static::deleting(function ($team) {
            $team->members()->detach();
            $team->invitations()->delete();
        });
    }

    /**
     * Get the owner of the team.
     */
    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * Get all of the team's users including its owner.
     */
    public function members()
    {
        return $this->belongsToMany(User::class, 'team_members')
            ->withPivot('role')
            ->withTimestamps()
            ->orWhere('users.id', $this->owner_id);
    }

    /**
     * Get all of the team's users excluding its owner.
     */
    public function users()
    {
        return $this->belongsToMany(User::class, 'team_members')
            ->withPivot('role')
            ->withTimestamps();
    }

    /**
     * Get all projects for the team.
     */
    public function projects()
    {
        return $this->hasMany(Project::class);
    }

    /**
     * Get all tasks for the team.
     */
    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    public function invitations()
    {
        return $this->hasMany(TeamInvitation::class);
    }

    /**
     * Check if the given user is the owner of the team
     *
     * @param  \App\Models\User|null  $user
     * @return bool
     */
    public function isOwnedBy($user = null)
    {
        $user = $user ?? auth()->user();
        return $user && $user->id === $this->owner_id;
    }

    public function addMember(User $user, string $role)
    {
        $existingMember = $this->members()
            ->where('user_id', $user->id)
            ->first();

        if ($existingMember) {
            $existingMember->update(['role' => $role]);
            return $existingMember;
        }

        return $this->members()->create([
            'user_id' => $user->id,
            'role' => $role
        ]);
    }

    public function removeMember(User $user)
    {
        return $this->members()
            ->where('user_id', $user->id)
            ->delete();
    }
}
