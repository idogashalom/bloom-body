<?php
use App\Models\Product;
use App\Models\Category;

// Create categories
$bodyCare = Category::firstOrCreate(['name' => 'Body Care']);
$skinCare = Category::firstOrCreate(['name' => 'Skin Care']);
$faceCare = Category::firstOrCreate(['name' => 'Face Care']);

$products = [
    [
        'name' => 'Glow Body Oil',
        'description' => 'Glow Body Oil',
        'price' => 12000,
        'stock_quantity' => 24,
        'category_id' => $bodyCare->id,
        'is_featured' => true,
        'is_available' => true,
        'image' => '/storage/products/1.jpg'
    ],
    [
        'name' => 'Luxury Body Butter',
        'description' => 'Luxury Body Butter',
        'price' => 8500,
        'stock_quantity' => 18,
        'category_id' => $bodyCare->id,
        'is_featured' => true,
        'is_available' => true,
        'image' => '/storage/products/2.jpg'
    ],
    [
        'name' => 'Brightening Soap',
        'description' => 'Brightening Soap',
        'price' => 3500,
        'stock_quantity' => 32,
        'category_id' => $skinCare->id,
        'is_featured' => false,
        'is_available' => true,
        'image' => '/storage/products/3.jpg'
    ],
    [
        'name' => 'Exfoliating Scrub',
        'description' => 'Exfoliating Scrub',
        'price' => 4500,
        'stock_quantity' => 15,
        'category_id' => $skinCare->id,
        'is_featured' => false,
        'is_available' => true,
        'image' => '/storage/products/4.jpg'
    ],
    [
        'name' => 'Serum Glow',
        'description' => 'Serum Glow',
        'price' => 10000,
        'stock_quantity' => 20,
        'category_id' => $faceCare->id,
        'is_featured' => true,
        'is_available' => true,
        'image' => '/storage/products/5.jpg'
    ],
    [
        'name' => 'Whitening Lotion',
        'description' => 'Whitening Lotion',
        'price' => 6000,
        'stock_quantity' => 30,
        'category_id' => $bodyCare->id,
        'is_featured' => false,
        'is_available' => true,
        'image' => '/storage/products/6.jpg'
    ]
];

foreach ($products as $p) {
    Product::updateOrCreate(['name' => $p['name']], $p);
}

echo "Database seeded with image products.\n";
