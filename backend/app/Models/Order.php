<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = ['user_id', 'order_number', 'total_amount', 'status', 'shipping_address', 'tracking_number', 'delivery_date'];

    protected $casts = [
        'delivery_date' => 'date',
        'total_amount' => 'decimal:2',
    ];

    public function items() { return $this->hasMany(OrderItem::class); }
    public function user() { return $this->belongsTo(User::class); }
    public function payment() { return $this->hasOne(Payment::class); }
}
