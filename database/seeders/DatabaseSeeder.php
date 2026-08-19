<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // Kabupaten (Superadmin)
        User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'nama' => 'Test User',
                'role' => 'superadmin',
                'password' => \Illuminate\Support\Facades\Hash::make('password'),
                'is_active' => true,
            ]
        );

        // Kecamatan
        User::firstOrCreate(
            ['email' => 'kecamatan@example.com'],
            [
                'nama' => 'Admin Kecamatan',
                'role' => 'admin_kecamatan',
                'password' => \Illuminate\Support\Facades\Hash::make('password'),
                'is_active' => true,
            ]
        );

        // Kelurahan
        User::firstOrCreate(
            ['email' => 'kelurahan@example.com'],
            [
                'nama' => 'Admin Kelurahan',
                'role' => 'admin_kelurahan',
                'password' => \Illuminate\Support\Facades\Hash::make('password'),
                'is_active' => true,
            ]
        );

        $this->call([
            DisasterDataSeeder::class,
            RegionalAndSupportSeeder::class,
        ]);
    }
}
