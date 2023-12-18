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
          'default_password' => Hash::check(config('app.user_default_password', ''), $user->password),
          'authorization' => [
              'token' => $token,
              'type' => 'bearer',
              'expires_in' => 60 * 24 * 365.25
          ]
      ]);
  }

  public function register(Request $request)
  {
      if (User::where('email', $request->email)->count() > 0) {
        return response()->json([
          'message' => 'email-existente',
        ], 400);
      }

      $user = User::create([
          'name' => $request->name,
          'email' => $request->email,
          'password' => Hash::make(config('app.user_default_password', '')),
          'nivel' => $request->nivel
      ]);

      return response()->json([
          'message' => 'created',
          'user' => $user
      ], 201);
  }

  public function updateUser(Request $request)
  {
    $user = User::find($request->user_id);

    if ($user === null) {
      return response()->json([
        'message' => 'not-found',
      ], 404);
    }

    if (User::where('email', $request->email)->where('id', '!=', $request->user_id)->count() > 0) {
      return response()->json([
        'message' => 'email-existente',
      ], 400);
    }

    $user->name = $request->name;
    $user->email = $request->email;
    $user->nivel = $request->nivel;
    $user->save();

    return response()->json([
        'message' => 'created',
        'user' => $user
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

  public function resetPassword(Request $request) {
    $user = User::find($request?->user_id);

    if ($user->nivel === "Super-Admin" && in_array(Auth::user()->nivel(), ["Admin", "User"])) {
      return response()->json([
        'message' => 'unauthorized',
      ], 403);
    }

    if ($user === null) {
      return response()->json([
        'message' => 'not-found',
      ], 400);
    }
    
    $user->password = Hash::make(config('app.user_default_password', ''));
    
    if(Auth::user()->setor_id !== $user->setor_id && Auth::user()->nivel !== 'Super-Admin') {
      return response()->json([
        'message' => 'unauthorized'
      ], 403);
    }

    $user->save();

    return response()->json([
      'message' => 'ok',
    ], 200);
  }

  public function changePassword(Request $request) {
    if ($request->newPassword !== $request->confirmPassword) {
      return response()->json([
        'message' => 'wrong-confirm-password',
      ], 400);
    }
    
    $user = User::find(Auth::user()->id);

    if ($user === null) {
      return response()->json([
        'message' => 'not-found',
      ], 400);
    }

    if (!Hash::check($request->currentPassword, Auth::user()->password)) {
      return response()->json([
        'message' => 'wrong-current-password',
      ], 403);
    }

    $user->password = Hash::make($request->newPassword);
    $user->save();

    return response()->json([
      'message' => 'ok',
    ], 200);
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