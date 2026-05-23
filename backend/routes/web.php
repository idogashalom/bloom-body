<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Response;

if (! function_exists('bloom_asset_response')) {
    function bloom_asset_response(string $file)
    {
        $types = [
            'css' => 'text/css',
            'js' => 'application/javascript',
            'svg' => 'image/svg+xml',
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'webp' => 'image/webp',
            'woff' => 'font/woff',
            'woff2' => 'font/woff2',
        ];

        $extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));

        return Response::make(file_get_contents($file), 200, [
            'Content-Type' => $types[$extension] ?? 'application/octet-stream',
        ]);
    }
}

Route::get('/', function () {
    return file_get_contents(base_path('../frontend/dist/index.html'));
});

Route::get('/assets/{path}', function (string $path) {
    $file = base_path('../frontend/dist/assets/' . $path);

    abort_unless(file_exists($file), 404);

    return bloom_asset_response($file);
})->where('path', '.*');

Route::get('/{file}', function (string $file) {
    $path = base_path('../frontend/dist/' . $file);

    abort_unless(file_exists($path), 404);

    return bloom_asset_response($path);
})->where('file', 'favicon\.svg|icons\.svg');

// Legacy Blade admin routes kept available without overriding the React admin dashboard.
Route::prefix('legacy-admin')->group(function () {
    Route::get('/login', [\App\Http\Controllers\Admin\AuthController::class, 'showLoginForm'])->name('admin.login');
    Route::post('/login', [\App\Http\Controllers\Admin\AuthController::class, 'login'])->name('admin.login.submit');
    Route::post('/logout', [\App\Http\Controllers\Admin\AuthController::class, 'logout'])->name('admin.logout');
    
    Route::get('/dashboard', [\App\Http\Controllers\Admin\DashboardController::class, 'index'])->name('admin.dashboard');
});

Route::fallback(function () {
    return file_get_contents(base_path('../frontend/dist/index.html'));
});
