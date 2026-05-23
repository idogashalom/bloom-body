<?php

$migrationsPath = __DIR__ . '/database/migrations';
$files = scandir($migrationsPath);

$schemas = [
    'admins' => <<<EOT
        Schema::create('admins', function (Blueprint \$table) {
            \$table->id();
            \$table->string('name');
            \$table->string('email')->unique();
            \$table->timestamp('email_verified_at')->nullable();
            \$table->string('password');
            \$table->rememberToken();
            \$table->timestamps();
        });
EOT,
    'categories' => <<<EOT
        Schema::create('categories', function (Blueprint \$table) {
            \$table->id();
            \$table->string('name');
            \$table->string('slug')->unique();
            \$table->text('description')->nullable();
            \$table->timestamps();
        });
EOT,
    'products' => <<<EOT
        Schema::create('products', function (Blueprint \$table) {
            \$table->id();
            \$table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            \$table->string('name');
            \$table->string('slug')->unique();
            \$table->text('description')->nullable();
            \$table->decimal('price', 10, 2);
            \$table->string('image')->nullable();
            \$table->boolean('is_available')->default(true);
            \$table->boolean('is_featured')->default(false);
            \$table->integer('stock_quantity')->default(0);
            \$table->timestamps();
        });
EOT,
    'orders' => <<<EOT
        Schema::create('orders', function (Blueprint \$table) {
            \$table->id();
            \$table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            \$table->string('order_number')->unique();
            \$table->decimal('total_amount', 10, 2);
            \$table->enum('status', ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'])->default('Pending');
            \$table->text('shipping_address')->nullable();
            \$table->string('tracking_number')->nullable();
            \$table->timestamps();
        });
EOT,
    'order_items' => <<<EOT
        Schema::create('order_items', function (Blueprint \$table) {
            \$table->id();
            \$table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            \$table->foreignId('product_id')->nullable()->constrained('products')->nullOnDelete();
            \$table->integer('quantity');
            \$table->decimal('price', 10, 2);
            \$table->timestamps();
        });
EOT,
    'cart_items' => <<<EOT
        Schema::create('cart_items', function (Blueprint \$table) {
            \$table->id();
            \$table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
            \$table->string('session_id')->nullable();
            \$table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            \$table->integer('quantity')->default(1);
            \$table->timestamps();
        });
EOT,
    'payments' => <<<EOT
        Schema::create('payments', function (Blueprint \$table) {
            \$table->id();
            \$table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            \$table->string('reference')->unique();
            \$table->string('gateway');
            \$table->decimal('amount', 10, 2);
            \$table->enum('status', ['Pending', 'Success', 'Failed'])->default('Pending');
            \$table->timestamps();
        });
EOT,
    'testimonials' => <<<EOT
        Schema::create('testimonials', function (Blueprint \$table) {
            \$table->id();
            \$table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            \$table->text('content');
            \$table->integer('rating')->default(5);
            \$table->boolean('is_approved')->default(false);
            \$table->integer('likes')->default(0);
            \$table->timestamps();
        });
EOT,
    'notifications' => <<<EOT
        Schema::create('notifications', function (Blueprint \$table) {
            \$table->id();
            \$table->string('title');
            \$table->text('message')->nullable();
            \$table->string('image')->nullable();
            \$table->string('type')->default('banner'); // banner, text
            \$table->boolean('is_active')->default(true);
            \$table->timestamps();
        });
EOT,
];

foreach ($files as $file) {
    if (strpos($file, '.php') === false) continue;
    
    foreach ($schemas as $table => $schema) {
        if (strpos($file, "create_{$table}_table.php") !== false) {
            $content = file_get_contents($migrationsPath . '/' . $file);
            $pattern = "/Schema::create\('{$table}', function \(Blueprint \\\$table\) \{.*?\}\);/ms";
            $content = preg_replace($pattern, $schema, $content);
            file_put_contents($migrationsPath . '/' . $file, $content);
            echo "Updated $file\n";
        }
    }
}
