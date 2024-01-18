<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
  public function index(Request $request)
  {
    $users = User::paginate($request?->per_page || 10);
    return $users;
  }

  public function query(Request $request)
  {
    $query = User::query();

    $query->withTrashed();

    foreach($request->columnFilters as $filter) {
      $query = $query->where($filter["id"], 'like', '%'.$filter["value"].'%');
    }

    foreach($request->sorting as $order) {
      $query = $query->orderBy($order["id"], $order["desc"] ? "desc" : "asc");
    }

    $users = $query->paginate($request->per_page);

    return $users;
  }

  public function store(Request $request)
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

  public function update(Request $request)
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

  public function resetPassword(Request $request)
  {
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

  public function changePassword(Request $request)
  {
    if ($request->newPassword !== $request->newPasswordConfirmation) {
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

  public function show ($id)
  {
    $user = User::find($id);

    if (!$user) {
      return response()->json(["message" => "not-found"], 404);
    }

    return ["user" => $user];
  }

  public function delete ($id)
  {
    $user = User::withTrashed()->find($id);

    if (!$user) {
      return response()->json(["message" => "not-found"], 404);
    }

    if ($user->deleted_at === null) {
      $user->delete();
    } else {
      $user->restore();
    }

    $user->save();

    return ["user" => $user];
  }
}
