<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'id' => 1,
                'name' => 'Protein Powder',
                'slug' => 'protein-powder',
                'price' => 20000,
                'image' => 'bloom-product(1).jpeg',
            ],
            [
                'id' => 2,
                'name' => 'Protein Oats',
                'slug' => 'protein-oats',
                'price' => 18000,
                'image' => 'bloom-product(2).jpeg',
            ],
            [
                'id' => 3,
                'name' => 'Tummy Shrink Tea',
                'slug' => 'tummy-shrink-tea',
                'price' => 18000,
                'image' => 'combo-special.jpeg',
            ],
            [
                'id' => 4,
                'name' => 'Booty Gummies',
                'slug' => 'booty-gummies',
                'price' => 25000,
                'image' => 'bloom-product(3).jpeg',
            ],
            [
                'id' => 5,
                'name' => 'Nutrivia Gummies',
                'slug' => 'nutrivia-gummies',
                'price' => 20000,
                'image' => 'bloom-product(4).jpeg',
            ],
        ];

        foreach ($products as $product) {
            Product::firstOrCreate(
                ['id' => $product['id']],
                [
                    'name' => $product['name'],
                    'slug' => $product['slug'],
                    'price' => $product['price'],
                    'image' => $this->imageDataUrl($product['image']),
                    'is_available' => true,
                    'is_featured' => true,
                    'stock_quantity' => 10,
                ]
            );
        }
    }

    private function imageDataUrl(string $filename): ?string
    {
        $path = base_path("../frontend/src/assets/{$filename}");

        if (! is_file($path)) {
            return null;
        }

        $mimeType = mime_content_type($path) ?: 'image/jpeg';

        return "data:{$mimeType};base64,".base64_encode(file_get_contents($path));
    }
}
