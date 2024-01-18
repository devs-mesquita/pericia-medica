<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        \App\Models\User::firstOrCreate(["email" => "root@mesquita.rj.gov.br"], [
            "name" => "Root User",
            "email" => "root@mesquita.rj.gov.br",
            "role"    => "Super-Admin",
            "password" => Hash::make(config("app.user_default_password", "")),
        ]);
    }
}
