<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TorenControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_store_toren(): void
    {
        $response = $this->post('/toren', [
            'nama_daerah' => 'Bandung',
            'lokasi' => 'Jl. Merdeka No. 1',
            'kapasitas_maksimal' => 100,
            'volume_air' => 76.5,
        ]);

        $response->assertRedirect('/toren');
        $this->assertDatabaseHas('torens', [
            'nama_daerah' => 'Bandung',
            'lokasi' => 'Jl. Merdeka No. 1',
            'kapasitas_maksimal' => 100,
            'volume_air' => 76.5,
        ]);
    }
}
