<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\CartItem;
use App\Models\Payment;
use App\Models\Product;
class OrderController extends Controller {
    public function index(Request $request) { return response()->json($request->user()->orders()->with('items.product')->get()); }
    public function deliveryToday(Request $request) {
        $orders = $request->user()
            ->orders()
            ->with('items.product')
            ->whereDate('delivery_date', now()->toDateString())
            ->where('status', 'Order On The Way')
            ->latest()
            ->get();

        return response()->json($orders);
    }
    public function store(Request $request) {
        $data = $request->validate([
            'shipping_address' => 'required|string',
            'delivery_date' => 'nullable|date',
            'payment_method' => 'nullable|string|in:card,bank',
            'items' => 'nullable|array',
            'items.*.product_id' => 'required_with:items|exists:products,id',
            'items.*.quantity' => 'required_with:items|integer|min:1',
        ]);

        $items = collect($data['items'] ?? []);
        if ($items->isEmpty()) {
            $items = CartItem::with('product')
                ->where('user_id', $request->user()->id)
                ->get()
                ->map(fn ($item) => ['product_id' => $item->product_id, 'quantity' => $item->quantity]);
        }
        if ($items->isEmpty()) return response()->json(['message' => 'Cart is empty'], 400);

        $products = Product::whereIn('id', $items->pluck('product_id'))->get()->keyBy('id');
        foreach ($items as $item) {
            $product = $products->get($item['product_id']);
            if (! $product || ! $product->is_available) {
                return response()->json(['message' => ($product?->name ?? 'A product') . ' is currently unavailable.'], 422);
            }
        }

        $total = $items->sum(function($item) use ($products) {
            return $item['quantity'] * $products->get($item['product_id'])->price;
        });
        $order = Order::create([
            'user_id' => $request->user()->id,
            'order_number' => 'ORD-' . strtoupper(uniqid()),
            'total_amount' => $total,
            'shipping_address' => $data['shipping_address'],
            'delivery_date' => $data['delivery_date'] ?? null,
        ]);
        
        foreach ($items as $item) {
            $product = $products->get($item['product_id']);
            OrderItem::create(['order_id' => $order->id, 'product_id' => $product->id, 'quantity' => $item['quantity'], 'price' => $product->price]);
        }
        Payment::create([
            'order_id' => $order->id,
            'reference' => 'PAY-' . strtoupper(uniqid()),
            'gateway' => $data['payment_method'] ?? 'bank',
            'amount' => $total,
            'status' => 'Success',
        ]);
        CartItem::where('user_id', $request->user()->id)->delete();
        return response()->json($order->load(['items.product', 'payment']));
    }
    public function track(Request $request, $order_number) {
        $order = Order::where('order_number', $order_number)->with('items.product')->firstOrFail();
        return response()->json($order);
    }
}
