<?php

namespace Database\Seeders;

use App\Enums\Sales\BlockStatus;
use App\Models\Sales\Block;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BlockSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 279 , 280

        Block::create([
            'name' => '279',
            'description' => 'Description 1',
            'status' => BlockStatus::Available,
            'project_id' => 1,
        ]);

        Block::create([
            'name' => '280',
            'description' => 'Description 1',
            'status' => BlockStatus::Available,
            'project_id' => 1,
        ]);
    }
}
