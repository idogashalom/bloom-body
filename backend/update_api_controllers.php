<?php

$controllersPath = __DIR__ . '/app/Http/Controllers/Api';
if (!is_dir($controllersPath)) mkdir($controllersPath, 0755, true);

$controllers = [
    'AuthController' => <<<EOT
<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
class AuthController extends Controller {
    public function register(Request \$request) {
        \$request->validate(['name' => 'required', 'email' => 'required|email|unique:users', 'password' => 'required|min:6']);
        \$user = User::create(['name' => \$request->name, 'email' => \$request->email, 'password' => Hash::make(\$request->password)]);
        return response()->json(['token' => \$user->createToken('API')->plainTextToken, 'user' => \$user]);
    }
    public function login(Request \$request) {
        \$request->validate(['email' => 'required|email', 'password' => 'required']);
        \$user = User::where('email', \$request->email)->first();
        if (!\$user || !Hash::check(\$request->password, \$user->password)) return response()->json(['message' => 'Invalid credentials'], 401);
        return response()->json(['token' => \$user->createToken('API')->plainTextToken, 'user' => \$user]);
    }
    public function logout(Request \$request) {
        \$request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out']);
    }
}
EOT,
    'ProductController' => <<<EOT
<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Product;
class ProductController extends Controller {
    public function index() { return response()->json(Product::where('is_available', true)->get()); }
    public function featured() { return response()->json(Product::where('is_featured', true)->where('is_available', true)->get()); }
    public function show(\$id) { return response()->json(Product::findOrFail(\$id)); }
}
EOT,
    'CartController' => <<<EOT
<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\CartItem;
class CartController extends Controller {
    public function index(Request \$request) {
        \$cart = CartItem::with('product')->where('user_id', \$request->user()->id)->get();
        return response()->json(\$cart);
    }
    public function store(Request \$request) {
        \$request->validate(['product_id' => 'required|exists:products,id', 'quantity' => 'required|integer|min:1']);
        \$cartItem = CartItem::updateOrCreate(
            ['user_id' => \$request->user()->id, 'product_id' => \$request->product_id],
            ['quantity' => \$request->quantity]
        );
        return response()->json(\$cartItem);
    }
    public function destroy(Request \$request, \$id) {
        CartItem::where('user_id', \$request->user()->id)->where('id', \$id)->delete();
        return response()->json(['message' => 'Removed']);
    }
}
EOT,
    'OrderController' => <<<EOT
<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\CartItem;
class OrderController extends Controller {
    public function index(Request \$request) { return response()->json(\$request->user()->orders()->with('items.product')->get()); }
    public function store(Request \$request) {
        \$request->validate(['shipping_address' => 'required|string']);
        \$cartItems = CartItem::with('product')->where('user_id', \$request->user()->id)->get();
        if (\$cartItems->isEmpty()) return response()->json(['message' => 'Cart is empty'], 400);
        
        \$total = \$cartItems->sum(function(\$item) { return \$item->quantity * \$item->product->price; });
        \$order = Order::create([
            'user_id' => \$request->user()->id,
            'order_number' => 'ORD-' . strtoupper(uniqid()),
            'total_amount' => \$total,
            'shipping_address' => \$request->shipping_address
        ]);
        
        foreach (\$cartItems as \$item) {
            OrderItem::create(['order_id' => \$order->id, 'product_id' => \$item->product_id, 'quantity' => \$item->quantity, 'price' => \$item->product->price]);
        }
        CartItem::where('user_id', \$request->user()->id)->delete();
        return response()->json(\$order);
    }
    public function track(Request \$request, \$order_number) {
        \$order = Order::where('order_number', \$order_number)->with('items.product')->firstOrFail();
        return response()->json(\$order);
    }
}
EOT,
    'TestimonialController' => <<<EOT
<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Testimonial;
class TestimonialController extends Controller {
    public function index() { return response()->json(Testimonial::with('user')->where('is_approved', true)->get()); }
    public function store(Request \$request) {
        \$request->validate(['content' => 'required|string', 'rating' => 'required|integer|min:1|max:5']);
        \$test = Testimonial::create(['user_id' => \$request->user()->id, 'content' => \$request->content, 'rating' => \$request->rating]);
        return response()->json(\$test);
    }
    public function like(\$id) {
        \$test = Testimonial::findOrFail(\$id);
        \$test->increment('likes');
        return response()->json(\$test);
    }
}
EOT,
    'NotificationController' => <<<EOT
<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Notification;
class NotificationController extends Controller {
    public function index() { return response()->json(Notification::where('is_active', true)->get()); }
}
EOT,
];

foreach ($controllers as $name => $content) {
    file_put_contents($controllersPath . '/' . $name . '.php', $content);
}
echo "API Controllers written.";
