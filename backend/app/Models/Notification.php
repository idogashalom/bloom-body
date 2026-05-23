<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $fillable = ['title', 'message', 'image', 'type', 'is_active'];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
