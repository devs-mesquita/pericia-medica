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
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Carbon;
use App\Mail\RequerimentoCreate;

class RequerimentoController extends Controller
{
  public function index(Request $request) {
    $requerimentos = Requerimento::paginate($request->per_page);
    return $requerimentos;
  }

  public function store(Request $request) {
    DB::beginTransaction();
    try {
      $atestados = $request->file("atestado_files");

      // Protocolo:
      $hora_atual = Carbon::now('America/Sao_Paulo')->format('His');
      $caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      $shuffled = str_shuffle($caracteres);
      $protocolo = strtoupper(substr($shuffled,0,3)).rand(100,999).$hora_atual;

      $protocolo_existe = Requerimento::where('protocolo','=',$protocolo)->get();
      while (!$protocolo_existe->isEmpty()) {
          $hora_atual = Carbon::now('America/Sao_Paulo')->format('His');
          $shuffled = str_shuffle($caracteres);
          $protocolo = strtoupper(substr($shuffled,0,3)).rand(100,999).$hora_atual;
          $protocolo_existe = Requerimento::where('protocolo','=',$protocolo)->get();
      }

      $requerimento = Requerimento::create([
        'protocolo' => $protocolo,
        'nome' => $request->nome,
        'matricula' => $request->matricula,
        'local_lotacao' => $request->local_lotacao,
        'email' => $request->email,
        'inicio_expediente' => $request->inicio_expediente,
        'fim_expediente' => $request->fim_expediente,
        'inicio_atestado_date' => $request->inicio_atestado_date,
        'acumula_matricula' => $request->acumula_matricula === "sim" ? true : false,
        'status' => "em-analise",
      ]);

      if(!$atestados) {
        return response()->status(400)->json([ "message" => "missing-atestados" ]);
      }
      
      $atestadoFiles = [];
      foreach($atestados as $file) {
        $filename = $file->store("public/atestados");
        array_push($atestadoFiles, substr($filename, 17));
        RequerimentoAtestadoFile::create([
          'requerimento_id' => $requerimento->id,
          'filename' => substr($filename, 17),
          'extension' => $file->extension(),
        ]);
      };
      
      if ($request->acumula_matricula === "sim") {
        $afastamentos = $request->file("afastamento_files");

        if(!$afastamentos) {
          return response()->status(400)->json([ "message" => "missing-afastamentos" ]);
        }

        $afastamentoFiles = [];
        foreach($afastamentos as $file) {
          $filename = $file->store("public/afastamentos");
          array_push($afastamentoFiles, substr($filename, 20));
          RequerimentoAfastamentoFile::create([
            'requerimento_id' => $requerimento->id,
            'filename' => substr($filename, 20),
            'extension' => $file->extension(),
          ]);
        };

        try {
          Mail::to($requerimento->email)->send(new RequerimentoCreate($requerimento));
          $requerimento->envio_create = 1;

        } catch (Exception $e) {
          $requerimento->envio_create = 0;
        }
        $requerimento->update();
      }

      DB::commit();
      return response()->json([
        "protocolo" => $requerimento->protocolo,
        "message" => "new-requirement"
      ]);

    } catch (Exception $e) {
      foreach($atestadoFiles as $file) {
        unlink(storage_path('app/public/atestados/'.$file));
      }

      if(isset($afastamentoFiles)) {
        foreach($afastamentoFiles as $file) {
          unlink(storage_path('app/public/afastamentos/'.$file));
        }
      }
      DB::rollBack();
      return response()->status(400)->json([ "message" => "error" ]);
    }
  }
  
  public function show($id) {}

  public function avaliacao(Request $request, $id) {}
  
  public function confirmacao(Request $request, $protocolo) {}
  
  public function presenca(Request $request, $id) {}

  public function realocacao(Request $request) {}
}
