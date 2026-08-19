<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * Authenticate citizen user
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Email atau Password salah.'
            ], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Akun Anda telah dinonaktifkan.'
            ], 403);
        }

        $token = $user->createToken('mobile_app')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil.',
            'data' => [
                'id'    => (string) $user->id_user,
                'name'  => $user->nama,
                'email' => $user->email,
                'nik'   => '',
                'phone' => $user->no_telp ?? '',
                'role'  => $user->role ?? 'USER',
                'token' => $token,
            ]
        ]);
    }

    /**
     * Register new citizen account
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:150',
            'email' => 'required|email|unique:app_users,email',
            'phone' => 'required|string|max:20',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Pendaftaran gagal. ' . implode(' ', $validator->errors()->all()),
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'nama' => $request->name,
            'email' => $request->email,
            'no_telp' => $request->phone,
            'password' => Hash::make($request->password),
            'role' => 'USER',
            'is_active' => true,
        ]);

        // Gunakan createToken() Sanctum agar token tersimpan di personal_access_tokens
        // dan dapat divalidasi oleh middleware auth:sanctum
        $token = $user->createToken('mobile_app')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Registrasi berhasil.',
            'data' => [
                'id'    => (string) $user->id_user,
                'name'  => $user->nama,
                'email' => $user->email,
                'nik'   => $request->nik ?? '',
                'phone' => $user->no_telp,
                'token' => $token,
            ]
        ], 201);
    }

    /**
     * Request password reset link
     */
    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Format email tidak valid.'
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Email tidak terdaftar.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Tautan reset kata sandi telah dikirim ke email Anda.'
        ]);
    }

    /**
     * Get authenticated user profile
     *
     * Route diproteksi auth:sanctum — $request->user() dijamin tidak null.
     * Tidak perlu cek manual token / remember_token.
     */
    public function me(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'data' => [
                'id'    => (string) $user->id_user,
                'name'  => $user->nama,
                'email' => $user->email,
                'phone' => $user->no_telp ?? '',
                'role'  => $user->role,
            ]
        ]);
    }
}
