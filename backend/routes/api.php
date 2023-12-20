<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;

Route::controller(AuthController::class)->group(function () {
  Route::post('login', 'login');
  Route::post('logout', 'logout');
  Route::post('refresh', 'refresh');
});

Route::post('requerimentos', function (Request $request) {
  $atestados = $request->file("atestado_files");

  if(!$atestados) {
    return response()->status(400)->json([ "message" => "missing-atestados" ]);
  }

  foreach($atestados as $file) {
    $file->store("public/atestados");
  };

  if ($request->acumula_matricula === "sim") {
    $afastamentos = $request->file("afastamento_files");

    if(!$afastamentos) {
      return response()->status(400)->json([ "message" => "missing-afastamentos" ]);
    }
    
    foreach($afastamentos as $file) {
      $file->store("public/afastamentos");
    };
  }

  return response()->json([
    "protocolo" => "ABC123456789",
    "message" => "new-requirement"
  ]);
});

// Authenticated, >= User:
Route::middleware(['api-auth'])->group(function () {
  Route::get('checkpassword', [AuthController::class, 'checkDefaultPassword']);
  Route::post('changepassword', [AuthController::class, 'changePassword']);

  // >= Admin
  Route::middleware(['admin'])->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('resetpassword', [AuthController::class, 'resetPassword']);
  });
  
  // Super-Admin
  Route::middleware(['super-admin'])->group(function () {
    Route::get('user/{id}',   [AuthController::class, 'showUser']);
    Route::post('user/update',   [AuthController::class, 'updateUser']);
    Route::post('user/nivel', [AuthController::class, 'changeNivel']);
  });
});