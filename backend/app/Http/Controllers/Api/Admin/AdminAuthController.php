<?php
namespace App\Http\Controllers\Api\Admin;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Admin;
use Illuminate\Support\Facades\Hash;
class AdminAuthController extends Controller {
    public function login(Request $request) {
        $request->validate(['email' => 'required|email', 'password' => 'required']);
        $admin = Admin::where('email', $request->email)->first();
        if (!$admin || !Hash::check($request->password, $admin->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }
        return response()->json([
            'token' => $admin->createToken('admin-api')->plainTextToken,
            'admin' => $admin
        ]);
    }
    public function logout(Request $request) {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out']);
    }
    public function me(Request $request) {
        return response()->json($request->user());
    }
}