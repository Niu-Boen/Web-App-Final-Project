<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class MenuItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $menuItems = [
            // Main Dishes
            [
                'name' => 'Pad Thai',
                'description' => 'Traditional Thai stir-fried noodles with shrimp, tofu, and vegetables',
                'price' => 45.00,
                'category_id' => 1,
                'ingredients' => ['rice noodles', 'shrimp', 'tofu', 'bean sprouts', 'eggs', 'tamarind sauce'],
                'allergens' => ['shellfish', 'eggs', 'soy'],
                'preparation_time' => 15,
                'is_featured' => true,
            ],
            [
                'name' => 'Green Curry Rice',
                'description' => 'Spicy green curry with chicken served with jasmine rice',
                'price' => 50.00,
                'category_id' => 1,
                'ingredients' => ['chicken', 'green curry paste', 'coconut milk', 'thai basil', 'jasmine rice'],
                'allergens' => [],
                'preparation_time' => 20,
                'is_featured' => true,
            ],
            [
                'name' => 'Fried Rice',
                'description' => 'Thai-style fried rice with vegetables and choice of protein',
                'price' => 40.00,
                'category_id' => 1,
                'ingredients' => ['jasmine rice', 'vegetables', 'eggs', 'soy sauce'],
                'allergens' => ['eggs', 'soy'],
                'preparation_time' => 12,
            ],
            
            // Beverages
            [
                'name' => 'Thai Iced Tea',
                'description' => 'Traditional Thai tea with condensed milk',
                'price' => 25.00,
                'category_id' => 2,
                'ingredients' => ['thai tea', 'condensed milk', 'sugar', 'ice'],
                'allergens' => ['dairy'],
                'preparation_time' => 5,
            ],
            [
                'name' => 'Fresh Orange Juice',
                'description' => 'Freshly squeezed orange juice',
                'price' => 30.00,
                'category_id' => 2,
                'ingredients' => ['fresh oranges'],
                'allergens' => [],
                'preparation_time' => 3,
            ],
            [
                'name' => 'Coffee',
                'description' => 'Hot coffee, black or with milk',
                'price' => 20.00,
                'category_id' => 2,
                'ingredients' => ['coffee beans', 'water'],
                'allergens' => [],
                'preparation_time' => 5,
            ],
            
            // Snacks
            [
                'name' => 'Spring Rolls',
                'description' => 'Crispy vegetable spring rolls with sweet chili sauce',
                'price' => 35.00,
                'category_id' => 3,
                'ingredients' => ['vegetables', 'spring roll wrapper', 'sweet chili sauce'],
                'allergens' => ['gluten'],
                'preparation_time' => 8,
            ],
            [
                'name' => 'Chicken Satay',
                'description' => 'Grilled chicken skewers with peanut sauce',
                'price' => 40.00,
                'category_id' => 3,
                'ingredients' => ['chicken', 'peanut sauce', 'cucumber'],
                'allergens' => ['peanuts'],
                'preparation_time' => 15,
            ],
            
            // Desserts
            [
                'name' => 'Mango Sticky Rice',
                'description' => 'Sweet sticky rice with fresh mango and coconut milk',
                'price' => 35.00,
                'category_id' => 4,
                'ingredients' => ['sticky rice', 'mango', 'coconut milk', 'sugar'],
                'allergens' => [],
                'preparation_time' => 10,
                'is_featured' => true,
            ],
            [
                'name' => 'Ice Cream',
                'description' => 'Vanilla or chocolate ice cream',
                'price' => 25.00,
                'category_id' => 4,
                'ingredients' => ['milk', 'cream', 'sugar', 'vanilla/chocolate'],
                'allergens' => ['dairy'],
                'preparation_time' => 2,
            ],
        ];

        foreach ($menuItems as $item) {
            \App\Models\MenuItem::create($item);
        }
    }
}
