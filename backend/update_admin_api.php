<?php

$controllersPath = __DIR__ . '/app/Http/Controllers/Api/Admin';
if (!is_dir($controllersPath)) mkdir($controllersPath, 0755, true);

$controllers = [
    'AdminAuthController' => <<<EOT
<?php
namespace App\Http\Controllers\Api\Admin;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Admin;
use Illuminate\Support\Facades\Hash;
class AdminAuthController extends Controller {
    public function login(Request \$request) {
        \$request->validate(['email' => 'required|email', 'password' => 'required']);
        \$admin = Admin::where('email', \$request->email)->first();
        if (!\$admin || !Hash::check(\$request->password, \$admin->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }
        return response()->json([
            'token' => \$admin->createToken('admin-api')->plainTextToken,
            'admin' => \$admin
        ]);
    }
    public function logout(Request \$request) {
        \$request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out']);
    }
    public function me(Request \$request) {
        return response()->json(\$request->user());
    }
}
EOT,
    'AdminProductController' => <<<EOT
<?php
namespace App\Http\Controllers\Api\Admin;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use Illuminate\Support\Str;
class AdminProductController extends Controller {
    public function index() { return response()->json(Product::orderBy('id', 'desc')->get()); }
    public function store(Request \$request) {
        \$data = \$request->validate([
            'name' => 'required|string',
            'description' => 'nullable|string',
            'price' => 'required|numeric',
            'stock_quantity' => 'required|integer',
            'is_available' => 'boolean',
            'is_featured' => 'boolean',
            'image' => 'nullable|string'
        ]);
        \$data['slug'] = Str::slug(\$data['name']) . '-' . uniqid();
        return response()->json(Product::create(\$data));
    }
    public function update(Request \$request, \$id) {
        \$product = Product::findOrFail(\$id);
        \$product->update(\$request->all());
        return response()->json(\$product);
    }
    public function destroy(\$id) {
        Product::findOrFail(\$id)->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
EOT,
    'AdminOrderController' => <<<EOT
<?php
namespace App\Http\Controllers\Api\Admin;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
class AdminOrderController extends Controller {
    public function index(Request \$request) {
        \$query = Order::with(['user', 'items.product'])->orderBy('created_at', 'desc');
        return response()->json(\$query->get());
    }
    public function updateStatus(Request \$request, \$id) {
        \$request->validate(['status' => 'required|string']);
        \$order = Order::findOrFail(\$id);
        \$order->update(['status' => \$request->status]);
        return response()->json(\$order);
    }
}
EOT,
    'AdminNotificationController' => <<<EOT
<?php
namespace App\Http\Controllers\Api\Admin;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Notification;
class AdminNotificationController extends Controller {
    public function index() { return response()->json(Notification::orderBy('created_at', 'desc')->get()); }
    public function store(Request \$request) {
        \$data = \$request->validate(['title' => 'required', 'message' => 'nullable', 'type' => 'required', 'image' => 'nullable']);
        return response()->json(Notification::create(\$data));
    }
    public function destroy(\$id) {
        Notification::findOrFail(\$id)->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
EOT,
    'AdminDashboardController' => <<<EOT
<?php
namespace App\Http\Controllers\Api\Admin;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\OrderItem;
class AdminDashboardController extends Controller {
    public function analytics() {
        \$totalRevenue = Order::where('status', '!=', 'Cancelled')->sum('total_amount');
        \$totalOrders = Order::count();
        \$totalProducts = Product::count();
        \$featuredProducts = Product::where('is_featured', true)->count();
        
        // High demand products (by order count)
        \$topProducts = OrderItem::selectRaw('product_id, SUM(quantity) as total_sold')
            ->groupBy('product_id')
            ->orderByDesc('total_sold')
            ->limit(5)
            ->with('product')
            ->get()
            ->map(function(\$item) {
                return [
                    'name' => \$item->product ? \$item->product->name : 'Unknown',
                    'sold' => \$item->total_sold
                ];
            });

        // Order statuses
        \$orderStatuses = Order::selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->get();

        return response()->json([
            'totalRevenue' => \$totalRevenue,
            'totalOrders' => \$totalOrders,
            'totalProducts' => \$totalProducts,
            'featuredProducts' => \$featuredProducts,
            'topProducts' => \$topProducts,
            'orderStatuses' => \$orderStatuses
        ]);
    }
}
EOT,
];

foreach ($controllers as $name => $content) {
    file_put_contents($controllersPath . '/' . $name . '.php', $content);
}
echo "Admin API Controllers written.\n";
