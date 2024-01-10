<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\RequerimentoDirecionamento;

class RequerimentoDirecionamentoController extends Controller
{
  public function index(Request $request)
  {
    $query = RequerimentoDirecionamento::query();

    foreach($request->filter as $key => $value) {
      if ($value) {
        $query = $query->where($key, 'like', '%'.$value.'%');
      }
    }

    foreach($request->sort as $key => $order) {
      if ($order) {
        $query = $query->orderBy($key, $order);
      }
    }

    $direcionamentos = $query->paginate($request->per_page);

    return $direcionamentos;
  }
}
