<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiOrderCreationTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_create_and_track_an_order(): void
    {
        $user = User::factory()->create();
        $product = Product::create([
            'name' => 'Protein Powder',
            'slug' => 'protein-powder',
            'price' => 20000,
            'is_available' => true,
            'is_featured' => true,
            'stock_quantity' => 10,
        ]);
        $token = $user->createToken('API')->plainTextToken;

        $response = $this->withToken($token)->postJson('/api/orders', [
            'shipping_address' => implode("\n", [
                'Full Name: Bloom Customer',
                'Phone: 08000000000',
                'State: Lagos',
                'City/Area: Ikeja',
                'Address: 1 Bloom Street',
            ]),
            'payment_method' => 'card',
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 2,
                ],
            ],
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('user_id', $user->id)
            ->assertJsonPath('total_amount', '40000.00')
            ->assertJsonPath('payment.gateway', 'card')
            ->assertJsonPath('payment.status', 'Pending')
            ->assertJsonPath('items.0.product_id', $product->id)
            ->assertJsonPath('items.0.quantity', 2);

        $orderNumber = $response->json('order_number');

        $this->assertDatabaseHas('orders', [
            'user_id' => $user->id,
            'order_number' => $orderNumber,
            'total_amount' => 40000,
            'status' => 'Pending',
        ]);
        $this->assertDatabaseHas('order_items', [
            'product_id' => $product->id,
            'quantity' => 2,
            'price' => 20000,
        ]);
        $this->assertDatabaseHas('payments', [
            'gateway' => 'card',
            'amount' => 40000,
            'status' => 'Pending',
        ]);

        $this->withToken($token)
            ->getJson("/api/orders/{$orderNumber}")
            ->assertOk()
            ->assertJsonPath('order_number', $orderNumber)
            ->assertJsonPath('items.0.product_id', $product->id);
    }

    public function test_order_validation_returns_a_clear_message_for_unknown_products(): void
    {
        $user = User::factory()->create();

        $this->withToken($user->createToken('API')->plainTextToken)
            ->postJson('/api/orders', [
                'shipping_address' => '1 Bloom Street',
                'payment_method' => 'card',
                'items' => [
                    [
                        'product_id' => 999999,
                        'quantity' => 1,
                    ],
                ],
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['items.0.product_id'])
            ->assertJsonFragment([
                'A product in your cart is no longer available. Please refresh your cart.',
            ]);
    }
}
