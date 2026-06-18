<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;
use Carbon\Carbon;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $this->normalizeEmail($request);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json([
            'token' => $user->createToken('API')->plainTextToken,
            'user' => $user,
        ]);
    }

    public function login(Request $request): JsonResponse
    {
        $this->normalizeEmail($request);

        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        return response()->json([
            'token' => $user->createToken('API')->plainTextToken,
            'user' => $user,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out']);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $this->normalizeEmail($request);
        $this->normalizeProfilePasswordFields($request);

        $user = $request->user();
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'current_password' => ['nullable', 'required_with:password,password_confirmation', 'string'],
            'password' => ['nullable', 'required_with:current_password,password_confirmation', 'string', 'min:8', 'confirmed'],
        ]);

        $profileData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
        ];

        $newPasswordHash = null;

        if (! empty($validated['password'])) {
            if (! Hash::check($validated['current_password'], $user->password)) {
                return response()->json([
                    'message' => 'Current password is incorrect.',
                ], 422);
            }

            $newPasswordHash = Hash::make($validated['password']);
        }

        if ($newPasswordHash) {
            $profileData['password'] = $newPasswordHash;
        }

        DB::table('users')
            ->where('id', $user->id)
            ->update(array_merge($profileData, [
                'updated_at' => now(),
            ]));

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user' => $user->fresh(),
        ]);
    }

    /**
     * Send OTP to user's email for password reset
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $this->normalizeEmail($request);

        $validated = $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        // Generate 6-digit OTP
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Set OTP expiration to 15 minutes from now
        $user->update([
            'otp' => Hash::make($otp),
            'otp_expires_at' => Carbon::now()->addMinutes(15),
            'otp_verified' => false,
        ]);

        // Send OTP via email
        try {
            Mail::raw(
                "Your verification code is:\n\n{$otp}\n\nThis code will expire in 15 minutes.\n\nIf you did not request this password reset, please ignore this email.",
                function ($message) use ($user) {
                    $message->to($user->email)
                        ->subject('Password Reset Verification Code');
                }
            );
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to send OTP'], 500);
        }

        return response()->json([
            'message' => 'A verification code has been sent to your email address.',
            'email' => $user->email,
        ]);
    }

    /**
     * Verify OTP sent to user's email
     */
    public function verifyOtp(Request $request): JsonResponse
    {
        $this->normalizeEmail($request);

        $validated = $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
            'otp' => ['required', 'string', 'digits:6'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        // Check if OTP exists and hasn't expired
        if (!$user->otp || !$user->otp_expires_at || Carbon::now()->isAfter($user->otp_expires_at)) {
            return response()->json(['message' => 'OTP has expired. Please request a new one.'], 400);
        }

        // Verify OTP
        if (!Hash::check($validated['otp'], $user->otp)) {
            return response()->json(['message' => 'Invalid verification code.'], 400);
        }

        // Mark OTP as verified and invalidate the code so it cannot be reused
        $user->update([
            'otp_verified' => true,
            'otp' => null,
            'otp_expires_at' => null
        ]);

        return response()->json([
            'message' => 'Verification code verified successfully.',
            'email' => $user->email,
        ]);
    }

    /**
     * Reset password after OTP verification
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $this->normalizeEmail($request);

        $validated = $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        // Verify that OTP was verified
        if (!$user->otp_verified) {
            return response()->json(['message' => 'Please verify your email first.'], 400);
        }

        // Update password and clear OTP
        $user->update([
            'password' => Hash::make($validated['password']),
            'otp' => null,
            'otp_expires_at' => null,
            'otp_verified' => false,
        ]);

        return response()->json(['message' => 'Your password has been successfully reset.']);
    }

    /**
     * Resend OTP to user's email
     */
    public function resendOtp(Request $request): JsonResponse
    {
        $this->normalizeEmail($request);

        $validated = $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        // Generate new OTP
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Set OTP expiration to 15 minutes from now
        $user->update([
            'otp' => Hash::make($otp),
            'otp_expires_at' => Carbon::now()->addMinutes(15),
            'otp_verified' => false,
        ]);

        // Send OTP via email
        try {
            Mail::raw(
                "Your verification code is:\n\n{$otp}\n\nThis code will expire in 15 minutes.\n\nIf you did not request this password reset, please ignore this email.",
                function ($message) use ($user) {
                    $message->to($user->email)
                        ->subject('Password Reset Verification Code');
                }
            );
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to resend OTP'], 500);
        }

        return response()->json([
            'message' => 'A new verification code has been sent to your email address.',
            'email' => $user->email,
        ]);
    }

    private function normalizeEmail(Request $request): void
    {
        $request->merge([
            'email' => Str::lower(trim((string) $request->input('email'))),
        ]);
    }

    private function normalizeProfilePasswordFields(Request $request): void
    {
        $request->merge([
            'current_password' => $request->input('current_password', $request->input('currentPassword')),
            'password' => $request->input('password', $request->input('new_password', $request->input('newPassword'))),
            'password_confirmation' => $request->input(
                'password_confirmation',
                $request->input('new_password_confirmation', $request->input('confirmPassword'))
            ),
        ]);
    }
}
