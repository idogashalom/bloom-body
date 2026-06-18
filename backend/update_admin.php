<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Admin;
use Illuminate\Support\Facades\Hash;

$admin = Admin::first();
if ($admin) {
    $admin->email = 'stephanieabang260@gmail.com';
    $admin->password = Hash::make('password123');
    $admin->save();
    echo "Admin updated successfully.\n";
} else {
    Admin::create([
        'name' => 'Stephanie Abang',
        'email' => 'stephanieabang260@gmail.com',
        'password' => Hash::make('password123')
    ]);
    echo "Admin created successfully.\n";
}
