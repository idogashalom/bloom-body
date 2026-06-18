<?php
namespace App\Http\Controllers\Api\Admin;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Support\Str;
class AdminProductController extends Controller {
    public function index() { return response()->json(Product::with('category')->orderBy('id', 'desc')->get()); }

    public function categories() { return response()->json(Category::orderBy('name')->get()); }

    public function store(Request $request) {
        $data = $request->validate([
            'name' => 'required|string',
            'description' => 'nullable|string',
            'price' => 'required|numeric',
            'stock_quantity' => 'nullable|integer',
            'is_available' => 'boolean',
            'unavailable_message' => 'nullable|string',
            'is_featured' => 'boolean',
            'image' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'category_name' => 'nullable|string|max:255'
        ]);
        $data = $this->applyCategory($data);
        if ($request->has('is_available')) {
            $data['is_available'] = $request->boolean('is_available');
        }
        if ($request->has('is_featured')) {
            $data['is_featured'] = $request->boolean('is_featured');
        }
        $data['slug'] = Str::slug($data['name']) . '-' . uniqid();
        $data['stock_quantity'] = $data['stock_quantity'] ?? 0;
        return response()->json(Product::create($data));
    }

    public function update(Request $request, $id) {
        $product = Product::findOrFail($id);
        $data = $request->validate([
            'name' => 'sometimes|required|string',
            'description' => 'nullable|string',
            'price' => 'sometimes|required|numeric',
            'stock_quantity' => 'nullable|integer',
            'is_available' => 'boolean',
            'unavailable_message' => 'nullable|string',
            'is_featured' => 'boolean',
            'image' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'category_name' => 'nullable|string|max:255'
        ]);
        $data = $this->applyCategory($data);
        if ($request->has('is_available')) {
            $data['is_available'] = $request->boolean('is_available');
        }
        if ($request->has('is_featured')) {
            $data['is_featured'] = $request->boolean('is_featured');
        }
        if (isset($data['name'])) {
            $data['slug'] = Str::slug($data['name']) . '-' . $product->id;
        }
        $product->update($data);
        return response()->json($product->fresh('category'));
    }

    public function destroy($id) {
        Product::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }

    private function applyCategory(array $data): array
    {
        if (! empty($data['category_name'])) {
            $category = Category::firstOrCreate(
                ['slug' => Str::slug($data['category_name'])],
                ['name' => $data['category_name']]
            );
            $data['category_id'] = $category->id;
        }

        unset($data['category_name']);
        return $data;
    }
}
