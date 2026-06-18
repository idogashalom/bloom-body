<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\TestimonialController;
use App\Http\Controllers\Api\NotificationController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:3,1');
Route::post('/verify-otp', [AuthController::class, 'verifyOtp'])->middleware('throttle:5,1');
Route::post('/reset-password', [AuthController::class, 'resetPassword']);
Route::post('/resend-otp', [AuthController::class, 'resendOtp'])->middleware('throttle:3,1');

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/featured', [ProductController::class, 'featured']);
Route::get('/products/{id}', [ProductController::class, 'show']);

Route::get('/testimonials', [TestimonialController::class, 'index']);
Route::post('/testimonials/{id}/like', [TestimonialController::class, 'like']);

Route::get('/notifications', [NotificationController::class, 'index']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::put('/user', [AuthController::class, 'updateProfile']);

    // Cart
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart', [CartController::class, 'store']);
    Route::delete('/cart/{id}', [CartController::class, 'destroy']);

    // Orders
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/delivery-notifications', [OrderController::class, 'deliveryToday']);
    Route::get('/orders/{order_number}', [OrderController::class, 'track']);

    // Submit testimonial
    Route::post('/testimonials', [TestimonialController::class, 'store']);
});

// Admin API Routes
Route::prefix('admin')->group(function () {
    Route::post('/login', [\App\Http\Controllers\Api\Admin\AdminAuthController::class, 'login']);

    Route::middleware(['auth:sanctum'])->group(function () {
        Route::post('/logout', [\App\Http\Controllers\Api\Admin\AdminAuthController::class, 'logout']);
        Route::get('/me', [\App\Http\Controllers\Api\Admin\AdminAuthController::class, 'me']);

        Route::get('/dashboard/analytics', [\App\Http\Controllers\Api\Admin\AdminDashboardController::class, 'analytics']);

        Route::get('/categories', [\App\Http\Controllers\Api\Admin\AdminProductController::class, 'categories']);
        Route::get('/products', [\App\Http\Controllers\Api\Admin\AdminProductController::class, 'index']);
        Route::post('/products', [\App\Http\Controllers\Api\Admin\AdminProductController::class, 'store']);
        Route::put('/products/{id}', [\App\Http\Controllers\Api\Admin\AdminProductController::class, 'update']);
        Route::delete('/products/{id}', [\App\Http\Controllers\Api\Admin\AdminProductController::class, 'destroy']);

        Route::get('/orders', [\App\Http\Controllers\Api\Admin\AdminOrderController::class, 'index']);
        Route::post('/orders/delivery-schedule', [\App\Http\Controllers\Api\Admin\AdminOrderController::class, 'scheduleDelivery']);
        Route::put('/orders/{id}/status', [\App\Http\Controllers\Api\Admin\AdminOrderController::class, 'updateStatus']);

        Route::get('/notifications', [\App\Http\Controllers\Api\Admin\AdminNotificationController::class, 'index']);
        Route::post('/notifications', [\App\Http\Controllers\Api\Admin\AdminNotificationController::class, 'store']);
        Route::delete('/notifications/{id}', [\App\Http\Controllers\Api\Admin\AdminNotificationController::class, 'destroy']);
    });
});
