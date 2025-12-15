<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        \App\Models\User::create([
            'student_id' => 'ADMIN001',
            'name' => 'Admin User',
            'email' => 'admin@apiu.edu',
            'password' => bcrypt('password'),
            'role' => 'admin',
            'gender' => 'male',
            'account_balance' => 11000, // Initial balance for male admin
            'is_active' => true,
        ]);

        // Create staff user
        \App\Models\User::create([
            'student_id' => 'STAFF001',
            'name' => 'Cafeteria Staff',
            'email' => 'staff@apiu.edu',
            'password' => bcrypt('password'),
            'role' => 'staff',
            'gender' => 'female',
            'account_balance' => 10000, // Initial balance for female staff
            'is_active' => true,
        ]);

        // Create finance manager user
        \App\Models\User::create([
            'student_id' => 'FINANCE001',
            'name' => 'Finance Manager',
            'email' => 'finance@apiu.edu',
            'password' => bcrypt('password'),
            'role' => 'finance',
            'gender' => 'male',
            'account_balance' => 11000, // Initial balance for male finance manager
            'is_active' => true,
        ]);

        // Create test student users
        \App\Models\User::create([
            'student_id' => '2024001',
            'name' => 'John Doe',
            'email' => 'john@student.apiu.edu',
            'password' => bcrypt('password'),
            'role' => 'student',
            'gender' => 'male',
            'account_balance' => 11000,
            'is_active' => true,
        ]);

        \App\Models\User::create([
            'student_id' => '2024002',
            'name' => 'Jane Smith',
            'email' => 'jane@student.apiu.edu',
            'password' => bcrypt('password'),
            'role' => 'student',
            'gender' => 'female',
            'account_balance' => 10000,
            'is_active' => true,
        ]);
    }
}
