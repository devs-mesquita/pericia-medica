<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Carbon;

class AuthController extends Controller
{
  public function login(Request $request)
  {
      $request->validate([
          'email' => 'required|string|email',
          'password' => 'required|string',
      ]);
      $credentials = $request->only('email', 'password');
      $token = Auth::attempt($credentials);
      
      if (!$token) {
          return response()->json([
              'message' => 'unauthorized',
          ], 401);
      }

      $user = User::find(Auth::id());
      return response()->json([
          'user' => $user,
          'usingDefaultPassword' => Hash::check(config('app.user_default_password', ''), $user->password),
          'authorization' => [
              'token' => $token,
              'type' => 'bearer',
              'expires_in' => 60 * 24 * 365.25
          ]
      ]);
  }

  public function logout()
  {
      Auth::logout();
      return response()->json([
          'message' => 'ok',
      ]);
  }

  public function refresh()
  {
      return response()->json([
          'user' => User::find(Auth::id()),
          'authorization' => [
              'token' => Auth::refresh(),
              'type' => 'bearer',
              'expires_in' => 60 * 24 * 365.25
          ]
      ]);
  }

  public function checkDefaultPassword(Request $request)
  {
    $user = User::find(Auth::user()?->id);
      
    if ($user === null) {
      return response()->json([
        'message' => 'not-found',
      ]);
    }

    if (Hash::check(config('app.user_default_password', ''), $user->password)) {
      return response()->json([
        'message' => 'default-password',
      ]);
    }

    return response()->json(['message' => 'ok']);
  }
}