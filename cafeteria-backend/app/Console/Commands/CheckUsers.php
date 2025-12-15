<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;

class CheckUsers extends Command
{
    protected $signature = 'check:users';
    protected $description = 'Check existing users';

    public function handle()
    {
        $users = User::all(['id', 'email', 'student_id', 'name']);
        
        $this->info('Existing users:');
        foreach ($users as $user) {
            $this->line("ID: {$user->id}, Email: {$user->email}, Student ID: {$user->student_id}, Name: {$user->name}");
        }
        
        return 0;
    }
}