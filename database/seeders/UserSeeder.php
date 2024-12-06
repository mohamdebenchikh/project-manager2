<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'remember_token' => Str::random(10),
            'active' => true,
        ]);

        // Create 50 random users
        for ($i = 1; $i <= 50; $i++) {
            User::create([
                'name' => fake()->name(),
                'email' => fake()->unique()->safeEmail(),
                'email_verified_at' => now(),
                'password' => Hash::make('password'), // same password for all users for testing
                'remember_token' => Str::random(10),
                'active' => true,
                'bio' => fake()->text(200),
                'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=' . Str::random(10),
            ]);
        }
    }
}
