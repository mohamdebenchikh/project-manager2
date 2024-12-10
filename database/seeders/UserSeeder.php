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

        User::factory(10)->create([
            'password' => Hash::make('password'), // same password for all users for testing
            'active' => true,
            'avatar' => fn () => 'https://api.dicebear.com/7.x/avataaars/svg?seed=' . Str::random(10),
        ]);
    }
}
