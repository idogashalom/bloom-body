<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = ['category_id', 'name', 'slug', 'description', 'price', 'image', 'is_available', 'is_featured', 'stock_quantity'];

    protected $casts = [
        'price' => 'decimal:2',
        'is_available' => 'boolean',
        'is_featured' => 'boolean',
        'stock_quantity' => 'integer',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
