<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\CartItem;
use App\Models\Product;
class CartController extends Controller {
    public function index(Request $request) {
        $cart = CartItem::with('product')->where('user_id', $request->user()->id)->get();
        return response()->json($cart);
    }
    public function store(Request $request) {
        $request->validate(['product_id' => 'required|exists:products,id', 'quantity' => 'required|integer|min:1']);
        $product = Product::findOrFail($request->product_id);
        if (! $product->is_available) {
            return response()->json(['message' => 'This product is currently unavailable.'], 422);
        }
        $cartItem = CartItem::updateOrCreate(
            ['user_id' => $request->user()->id, 'product_id' => $request->product_id],
            ['quantity' => $request->quantity]
        );
        return response()->json($cartItem);
    }
    public function destroy(Request $request, $id) {
        CartItem::where('user_id', $request->user()->id)->where('id', $id)->delete();
        return response()->json(['message' => 'Removed']);
    }
}
