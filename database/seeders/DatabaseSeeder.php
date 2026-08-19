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
        User::factory()->create([
            'nama' => 'Test User',
            'email' => 'test@example.com',
            'role' => 'superadmin',
        ]);

        // Kecamatan
        User::factory()->create([
            'nama' => 'Admin Kecamatan',
            'email' => 'kecamatan@example.com',
            'role' => 'admin_kecamatan',
        ]);

        // Kelurahan
        User::factory()->create([
            'nama' => 'Admin Kelurahan',
            'email' => 'kelurahan@example.com',
            'role' => 'admin_kelurahan',
        ]);

        $this->call([
            DisasterDataSeeder::class,
            RegionalAndSupportSeeder::class,
        ]);
    }
}
