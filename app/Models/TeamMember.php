<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Team;
use App\Models\User;

/**
 * The TeamMember model represents a member of a team.
 *
 * @property int $id
 * @property int $team_id
 * @property int $user_id
 * @property string $role
 * @property-read \App\Models\Team $team
 * @property-read \App\Models\User $user
 */
class TeamMember extends Model
{
    use HasFactory;

    protected $fillable = [
        'team_id',
        'user_id',
        'role'
    ];

    public function team()
    {
        return $this->belongsTo(Team::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
