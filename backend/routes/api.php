<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;

Route::controller(AuthController::class)->group(function () {
  Route::post('login', 'login');
  Route::post('logout', 'logout');
  Route::post('refresh', 'refresh');
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