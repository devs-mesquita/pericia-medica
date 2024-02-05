<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\RequerimentoController;
use App\Http\Controllers\Api\RequerimentoDirecionamentoController;

Route::controller(AuthController::class)->group(function () {
  Route::get('checkpassword', 'checkDefaultPassword');
  Route::post('login', 'login');
  Route::post('logout', 'logout');
  Route::post('refresh', 'refresh');
});

Route::post('migrate_data', [RequerimentoController::class, 'migrateData']);
Route::post('requerimentos', [RequerimentoController::class, 'store']);
Route::post('requerimentos/{protocolo}/confirmacao', [RequerimentoController::class, 'confirmacao']);

// Authenticated, >= Guest:
Route::middleware(['api-auth'])->group(function () {
  Route::post('changepassword', [UserController::class, 'changePassword']);

  Route::get('requerimentos', [RequerimentoController::class, 'index']);
  Route::post('requerimentos/relatorio', [RequerimentoController::class, 'relatorio']);
  Route::get('requerimentos/{id}', [RequerimentoController::class, 'show']);
  Route::post('requerimentos/query', [RequerimentoController::class, 'query']);
  
  // >= User
  Route::middleware(['user'])->group(function () {
    Route::patch('requerimentos/{id}/avaliacao', [RequerimentoController::class, 'avaliacao']);
    Route::patch('requerimentos/{id}/presenca', [RequerimentoController::class, 'presenca']);
  });
  
  // >= Admin
  Route::middleware(['admin'])->group(function () {
    Route::get('direcionamentos', [RequerimentoDirecionamentoController::class, 'index']);
    Route::get('direcionamentos/{id}', [RequerimentoDirecionamentoController::class, 'show']);
    Route::post('direcionamentos/query', [RequerimentoDirecionamentoController::class, 'query']);
    Route::post('direcionamentos', [RequerimentoDirecionamentoController::class, 'store']);
    Route::patch('direcionamentos/{id}', [RequerimentoDirecionamentoController::class, 'update']);
    Route::delete('direcionamentos/{id}', [RequerimentoDirecionamentoController::class, 'delete']);
    
    Route::get('users', [UserController::class, 'index']);
    Route::get('users/{id}', [UserController::class, 'show']);
    Route::post('users/query', [UserController::class, 'query']);
    Route::post('users', [UserController::class, 'store']);
    Route::patch('users/{id}', [UserController::class, 'update']);
    Route::delete('users/{id}', [UserController::class, 'delete']);
    Route::patch('users/{id}/resetpassword', [UserController::class, 'resetPassword']);
  });

  // Super-Admin
  Route::middleware(['super-admin'])->group(function () {
    Route::get('/realocacao', [RequerimentoController::class, 'getRealocacoes']);
    Route::patch('/realocacao', [RequerimentoController::class, 'applyRealocacoes']);
    Route::post('/resend-failed-emails', [RequerimentoController::class, 'resendFailedEmails']);
  });
});