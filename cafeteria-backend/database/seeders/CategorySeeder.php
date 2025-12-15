<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Main Dishes',
                'description' => 'Rice, noodles, and main course meals',
                'sort_order' => 1,
            ],
            [
                'name' => 'Beverages',
                'description' => 'Hot and cold drinks',
                'sort_order' => 2,
            ],
            [
                'name' => 'Snacks',
                'description' => 'Light snacks and appetizers',
                'sort_order' => 3,
            ],
            [
                'name' => 'Desserts',
                'description' => 'Sweet treats and desserts',
                'sort_order' => 4,
            ],
        ];

        foreach ($categories as $category) {
            \App\Models\Category::create($category);
        }
    }
}
