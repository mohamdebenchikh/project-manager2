<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'avatar',
        'bio',
        'active',
        'current_team_id',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function ownedTeams()
    {
        return $this->hasMany(Team::class, 'owner_id');
    }

    public function teamMemberships()
    {
        return $this->hasMany(TeamMember::class);
    }

    /**
     * Get the teams that the user belongs to as a member
     */
    public function teams()
    {
        return $this->belongsToMany(Team::class, 'team_members')
                    ->withPivot('role')
                    ->withTimestamps();
    }

    public function allTeams()
    {
        return Team::where(function ($query) {
            $query->where('owner_id', $this->id)
                  ->orWhereHas('members', function ($query) {
                      $query->where('user_id', $this->id);
                  });
        })->get();
    }

    public function currentTeam()
    {
        return $this->belongsTo(Team::class, 'current_team_id');
    }

    /**
     * Get all projects created by the user.
     */
    public function projects()
    {
        return $this->hasMany(Project::class);
    }

    public function switchTeam($team)
    {
        $this->current_team_id = $team->id;
        $this->save();
    }

    public function personalTeam()
    {
        return $this->ownedTeams()->where('personal_team', true)->first();
    }

    public function assignedTasks()
    {
        return $this->belongsToMany(Task::class, 'task_user', 'user_id', 'task_id');
    }

    public function currentTeamWithRole()
    {
        return $this->belongsTo(Team::class, 'current_team_id')
            ->with(['members' => function ($query) {
                $query->where('user_id', $this->id);
            }])
            ->withCount(['members as is_owner' => function ($query) {
                $query->where('owner_id', $this->id);
            }]);
    }

    public function getCurrentTeamRole()
    {
        if (!$this->current_team_id) {
            return null;
        }
        
        return $this->teamMemberships()
            ->where('team_id', $this->current_team_id)
            ->value('role');
    }
}
