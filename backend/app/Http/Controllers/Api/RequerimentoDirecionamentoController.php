<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\RequerimentoDirecionamento;

class RequerimentoDirecionamentoController extends Controller
{
  public function index()
  {
    $direcionamentos = RequerimentoDirecionamento::orderBy("atendimento_presencial", "desc")->orderBy("name", "asc")->get();
    return $direcionamentos;
  }

  public function store(Request $request)
  {
    if (mb_strtoupper($request->name) === "RECUSADO") {
      return response()->json([
        "message" => "name-conflict"
      ], 400);
    }

    $checkNameConflict = RequerimentoDirecionamento::where("name", mb_strtoupper($request->name))->first();
    if ($checkNameConflict !== null) {
      return response()->json([
        "message" => "name-conflict"
      ], 400);
    }


    RequerimentoDirecionamento::create([
      "name" => mb_strtoupper($request->name),
      "atendimento_presencial" => $request->atendimento_presencial === "sim" ? true : false,
      "config" => json_encode($request->config),
    ]);

    return ["message" => "success"];
  }

  public function query(Request $request)
  {
    $query = RequerimentoDirecionamento::query();

    $query->withTrashed();

    if ($request->columnFilters) {
      foreach($request->columnFilters as $filter) {
        $query = $query->where($filter["id"], 'like', '%'.$filter["value"].'%');
      }
    }

    if ($request->sorting) {
      foreach($request->sorting as $order) {
        $query = $query->orderBy($order["id"], $order["desc"] ? "desc" : "asc");
      }
    }

    $direcionamentos = $query->paginate($request->per_page);

    return $direcionamentos;
  }

  public function update (Request $request, $id)
  {
    if (mb_strtoupper($request->name) === "RECUSADO") {
      return response()->json([
        "message" => "name-conflict"
      ], 400);
    }

    $checkNameConflict = RequerimentoDirecionamento::withTrashed()->where([
      ["name", mb_strtoupper($request->name)],
      ["id", "!=", $id]
    ])->first();
    if ($checkNameConflict !== null) {
      return response()->json([
        "message" => "name-conflict"
      ], 400);
    }

    RequerimentoDirecionamento::withTrashed()->where("id", $id)
    ->update([
      "name" => mb_strtoupper($request->name),
      "atendimento_presencial" => $request->atendimento_presencial === "sim" ? true : false,
      "config" => json_encode($request->config),
    ]);

    return ["message" => "success"];
  }

  public function show ($id)
  {
    $direcionamento = RequerimentoDirecionamento::withTrashed()->find($id);

    if (!$direcionamento) {
      return response()->json(["message" => "not-found"], 404);
    }

    return ["direcionamento" => $direcionamento];
  }

  public function delete ($id)
  {
    $direcionamento = RequerimentoDirecionamento::withTrashed()->find($id);

    if (!$direcionamento) {
      return response()->json(["message" => "not-found"], 404);
    }

    if ($direcionamento->deleted_at === null) {
      $direcionamento->delete();
    } else {
      $direcionamento->restore();
    }

    $direcionamento->save();

    return ["direcionamento" => $direcionamento];
  }

  public function getRealocacoes(Request $request) {}

  public function applyRealocacoes(Request $request) {}
}
