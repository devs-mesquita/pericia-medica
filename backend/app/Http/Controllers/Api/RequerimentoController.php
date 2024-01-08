<?php

namespace App\Http\Controllers\Api;

use App\Models\Requerimento;
use App\Models\RequerimentoDirecionamento;
use App\Models\RequerimentoReagendamento;
use App\Models\RequerimentoAtestadoFile;
use App\Models\RequerimentoAfastamentoFile;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Carbon;

class RequerimentoController extends Controller
{
  public function index(Request $request) {
    $requerimentos = Requerimento::paginate($request->per_page);
    return $requerimentos;
  }

  public function store(Request $request) {
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
  }
  
  public function show($id) {}

  public function avaliacao(Request $request, $id) {}
  
  public function confirmacao(Request $request, $protocolo) {}
  
  public function presenca(Request $request, $id) {}

  public function realocacao(Request $request) {}
}
