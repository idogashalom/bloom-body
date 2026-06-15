<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ApiAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registered_user_can_log_in_and_access_authenticated_routes(): void
    {
        $password = 'BloomPassword2026!';

        $registerResponse = $this->postJson('/api/register', [
            'name' => 'Bloom Customer',
            'email' => '  BLOOM.CUSTOMER@EXAMPLE.COM  ',
            'password' => $password,
        ]);

        $registerResponse
            ->assertOk()
            ->assertJsonPath('user.email', 'bloom.customer@example.com')
            ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email']]);

        $user = User::where('email', 'bloom.customer@example.com')->firstOrFail();

        $this->assertNotSame($password, $user->getRawOriginal('password'));
        $this->assertTrue(Hash::check($password, $user->password));
        $this->assertDatabaseHas('personal_access_tokens', [
            'tokenable_type' => User::class,
            'tokenable_id' => $user->id,
        ]);

        $loginResponse = $this->postJson('/api/login', [
            'email' => 'BLOOM.CUSTOMER@EXAMPLE.COM',
            'password' => $password,
        ]);

        $loginResponse
            ->assertOk()
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonPath('user.email', 'bloom.customer@example.com')
            ->assertJsonStructure(['token']);

        $this->withToken($loginResponse->json('token'))
            ->getJson('/api/user')
            ->assertOk()
            ->assertJsonPath('id', $user->id)
            ->assertJsonPath('email', 'bloom.customer@example.com');

        $this->assertDatabaseCount('personal_access_tokens', 2);
    }
}
