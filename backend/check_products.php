<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Product;
use App\Models\Category;

try {
    echo "Products count: " . Product::count() . "\n";
    echo "Categories count: " . Category::count() . "\n";
    if (Product::count() > 0) {
        $first = Product::first();
        echo "First product: " . json_encode($first, JSON_PRETTY_PRINT) . "\n";
    }
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
