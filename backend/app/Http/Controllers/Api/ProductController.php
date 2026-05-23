<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Product;
class ProductController extends Controller {
    public function index() { return response()->json(Product::with('category')->orderBy('id')->get()); }
    public function featured() { return response()->json(Product::with('category')->where('is_featured', true)->orderBy('id')->get()); }
    public function show($id) { return response()->json(Product::with('category')->findOrFail($id)); }
}
