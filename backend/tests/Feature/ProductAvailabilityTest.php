<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductAvailabilityTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_toggle_availability_for_one_product_without_affecting_others(): void
    {
        $available = Product::create([
            'name' => 'Available Product',
            'slug' => 'available-product',
            'price' => 1000,
            'is_available' => true,
            'stock_quantity' => 5,
        ]);

        $unavailable = Product::create([
            'name' => 'Unavailable Product',
            'slug' => 'unavailable-product',
            'price' => 2000,
            'is_available' => true,
            'stock_quantity' => 5,
        ]);

        $admin = Admin::create([
            'name' => 'Bloom Admin',
            'email' => 'admin@test.com',
            'password' => 'password',
        ]);
        $token = $admin->createToken('admin-api')->plainTextToken;

        $this->withToken($token)
            ->putJson("/api/admin/products/{$unavailable->id}", ['is_available' => false])
            ->assertOk()
            ->assertJsonPath('is_available', false);

        $this->assertDatabaseHas('products', [
            'id' => $unavailable->id,
            'is_available' => 0,
        ]);
        $this->assertDatabaseHas('products', [
            'id' => $available->id,
            'is_available' => 1,
        ]);
    }

    public function test_unavailable_products_cannot_be_ordered(): void
    {
        $user = User::factory()->create();
        $product = Product::create([
            'name' => 'Unavailable Product',
            'slug' => 'unavailable-product',
            'price' => 2000,
            'is_available' => false,
            'stock_quantity' => 5,
        ]);

        $this->withToken($user->createToken('API')->plainTextToken)
            ->postJson('/api/orders', [
                'shipping_address' => '1 Bloom Street',
                'payment_method' => 'card',
                'items' => [
                    [
                        'product_id' => $product->id,
                        'quantity' => 1,
                    ],
                ],
            ])
            ->assertStatus(422)
            ->assertJsonFragment([
                'message' => 'Unavailable Product is currently unavailable.',
            ]);
    }

    public function test_unavailable_products_cannot_be_added_to_cart(): void
    {
        $user = User::factory()->create();
        $product = Product::create([
            'name' => 'Unavailable Product',
            'slug' => 'unavailable-product',
            'price' => 2000,
            'is_available' => false,
            'stock_quantity' => 5,
        ]);

        $this->withToken($user->createToken('API')->plainTextToken)
            ->postJson('/api/cart', [
                'product_id' => $product->id,
                'quantity' => 1,
            ])
            ->assertStatus(422)
            ->assertJsonFragment([
                'message' => 'This product is currently unavailable.',
            ]);
    }
}
