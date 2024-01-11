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

    foreach($request->columnFilters as $filter) {
      $query = $query->where($filter->id, 'like', '%'.$filter->value.'%');
    }

    foreach($request->sorting as $order) {
      $query = $query->orderBy($order->id, $order->value);
    }

    $direcionamentos = $query->paginate($request->per_page);

    return $direcionamentos;
  }
}
