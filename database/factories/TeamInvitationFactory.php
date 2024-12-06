<?php

namespace Database\Factories;

use App\Models\Team;
use App\Models\User;
use App\Models\TeamInvitation;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class TeamInvitationFactory extends Factory
{
    protected $model = TeamInvitation::class;

    public function definition()
    {
        return [
            'team_id' => Team::factory(),
            'email' => $this->faker->unique()->safeEmail(),
            'role' => $this->faker->randomElement(['admin', 'member']),
            'token' => Str::random(64),
            'status' => 'pending',
            'expires_at' => now()->addDays(7),
            'invited_by' => User::factory(),
            'reminder_count' => 0,
            'reminder_sent_at' => null
        ];
    }

    public function expired()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'expired',
                'expires_at' => now()->subDays(1)
            ];
        });
    }

    public function accepted()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'accepted',
                'accepted_at' => now()
            ];
        });
    }
}
