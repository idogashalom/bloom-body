<?php
namespace App\Http\Controllers\Api\Admin;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\OrderItem;
class AdminDashboardController extends Controller {
    public function analytics() {
        $totalRevenue = Order::where('status', '!=', 'Cancelled')->sum('total_amount');
        $totalOrders = Order::count();
        $totalProducts = Product::count();
        $featuredProducts = Product::where('is_featured', true)->count();
        
        // High demand products (by order count)
        $topProducts = OrderItem::selectRaw('product_id, SUM(quantity) as total_sold')
            ->groupBy('product_id')
            ->orderByDesc('total_sold')
            ->limit(5)
            ->with('product')
            ->get()
            ->map(function($item) {
                return [
                    'name' => $item->product ? $item->product->name : 'Unknown',
                    'sold' => $item->total_sold
                ];
            });

        // Order statuses
        $orderStatuses = Order::selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->get();

        return response()->json([
            'totalRevenue' => $totalRevenue,
            'totalOrders' => $totalOrders,
            'totalProducts' => $totalProducts,
            'featuredProducts' => $featuredProducts,
            'topProducts' => $topProducts,
            'orderStatuses' => $orderStatuses
        ]);
    }
}