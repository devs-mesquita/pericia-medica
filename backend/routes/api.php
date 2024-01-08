<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\RequerimentoController;

Route::controller(AuthController::class)->group(function () {
  Route::get('checkpassword', 'checkDefaultPassword');
  Route::post('login', 'login');
  Route::post('logout', 'logout');
  Route::post('refresh', 'refresh');
});

Route::post('requerimentos', [RequerimentoController::class, 'store']);
Route::post('requerimentos/{protocolo}/confirmacao', [RequerimentoController::class, 'confirmacao']);

// Authenticated, >= User:
Route::middleware(['api-auth'])->group(function () {
  Route::post('changepassword', [UserController::class, 'changePassword']);

  Route::get('requerimentos', [RequerimentoController::class, 'index']);
  Route::get('requerimentos/{id}', [RequerimentoController::class, 'show']);
  Route::post('requerimentos/{id}/avaliacao', [RequerimentoController::class, 'avaliacao']);
  Route::post('requerimentos/{id}/presenca', [RequerimentoController::class, 'presenca']);

  // >= Admin
  Route::middleware(['admin'])->group(function () {
    Route::get('users', [UserController::class, 'index']);
    Route::post('user/update', [UserController::class, 'updateUser']);
    Route::post('register', [UserController::class, 'register']);
    Route::post('resetpassword', [UserController::class, 'resetPassword']);
  });

  // Super-Admin
  Route::middleware(['super-admin'])->group(function () {
    Route::post('requerimentos/realocacao', [RequerimentoController::class, 'realocacao']);
  });
});