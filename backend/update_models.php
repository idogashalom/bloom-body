<?php

$modelsPath = __DIR__ . '/app/Models';
$files = scandir($modelsPath);

$fillables = [
    'Admin' => "    protected \$fillable = ['name', 'email', 'password'];\n    protected \$hidden = ['password', 'remember_token'];",
    'Category' => "    protected \$fillable = ['name', 'slug', 'description'];",
    'Product' => "    protected \$fillable = ['category_id', 'name', 'slug', 'description', 'price', 'image', 'is_available', 'is_featured', 'stock_quantity'];",
    'Order' => "    protected \$fillable = ['user_id', 'order_number', 'total_amount', 'status', 'shipping_address', 'tracking_number'];\n    public function items() { return \$this->hasMany(OrderItem::class); }\n    public function user() { return \$this->belongsTo(User::class); }\n    public function payment() { return \$this->hasOne(Payment::class); }",
    'OrderItem' => "    protected \$fillable = ['order_id', 'product_id', 'quantity', 'price'];\n    public function product() { return \$this->belongsTo(Product::class); }",
    'CartItem' => "    protected \$fillable = ['user_id', 'session_id', 'product_id', 'quantity'];\n    public function product() { return \$this->belongsTo(Product::class); }",
    'Payment' => "    protected \$fillable = ['order_id', 'reference', 'gateway', 'amount', 'status'];\n    public function order() { return \$this->belongsTo(Order::class); }",
    'Testimonial' => "    protected \$fillable = ['user_id', 'content', 'rating', 'is_approved', 'likes'];\n    public function user() { return \$this->belongsTo(User::class); }",
    'Notification' => "    protected \$fillable = ['title', 'message', 'image', 'type', 'is_active'];",
];

foreach ($files as $file) {
    if (strpos($file, '.php') === false) continue;
    
    $modelName = str_replace('.php', '', $file);
    if (isset($fillables[$modelName])) {
        $content = file_get_contents($modelsPath . '/' . $file);
        $fillableCode = $fillables[$modelName];
        
        // Check if model has HasFactory
        if (strpos($content, 'use HasFactory;') !== false) {
            $content = str_replace('use HasFactory;', "use HasFactory;\n\n{$fillableCode}", $content);
        } else {
            // For models that don't have HasFactory trait yet
            $content = preg_replace('/class\s+' . $modelName . '\s+extends\s+Model\s*\{/', "class $modelName extends Model\n{\n{$fillableCode}", $content);
        }
        
        file_put_contents($modelsPath . '/' . $file, $content);
        echo "Updated Model: $modelName\n";
    }
}
