<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Carbon;

use App\Models\Requerimento;
use App\Models\RequerimentoDirecionamento;
use App\Models\RequerimentoReagendamento;
use App\Models\RequerimentoAtestadoFile;
use App\Models\RequerimentoAfastamentoFile;

use App\Mail\RequerimentoCreateMail;
use App\Mail\RequerimentoAgendadoMail;
use App\Mail\RequerimentoNaoPresencialMail;
use App\Mail\RequerimentoRecusadoMail;

use App\Mail\ReagendamentoAgendadoMail;
use App\Mail\ReagendamentoNaoPresencialMail;
use App\Mail\ReagendamentoRecusadoMail;

class RequerimentoController extends Controller
{
  public function index(Request $request) {
    $query = Requerimento::query();

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

    $direcionamentos = $query->with('reagendamentos')->paginate($request->per_page);

    return $direcionamentos;
  }

  public function store(Request $request) {
    DB::beginTransaction();
    try {
      $atestados = $request->file("atestado_files");

      if(!$atestados) {
        return response()->json([ "message" => "missing-atestados" ], 400);
      }

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
          return response()->json([ "message" => "missing-afastamentos"], 400);
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
          Mail::to($requerimento->email)->send(new RequerimentoCreateMail($requerimento));
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
      return response()->json([ "message" => "error" ], 400);
    }
  }
  
  public function avaliacao(Request $request, $id) {
    DB::beginTransaction();
    try {
      $requerimento = Requerimento::with("reagendamentos")->findOrFail($id);
      
      // Reagendamento
      if ($requerimento->reagendamentos->count() > 0) {
        $latestReagendamento = $requerimento->reagendamentos[$requerimento->reagendamentos->count()-1];

        if ($request->direcionamento_id === "recusado") {
          $latestReagendamento->status = "recusado";
          $latestReagendamento->justificativa_recusa = $request->justificativa_recusa;
          $latestReagendamento->observacao_avaliador = $request->observacao_avaliador;
          $latestReagendamento->avaliado_at = Carbon::now();
          $latestReagendamento->avaliador_id = Auth::user()->id;

          try {
            Mail::to($requerimento->email)->send(new ReagendamentoRecusadoMail($requerimento, $latestReagendamento));
            $latestReagendamento->envio_avaliacao = 1;
  
          } catch (Exception $e) {
            $latestReagendamento->envio_avaliacao = 0;
          }

        } else {
          $direcionamento = RequerimentoDirecionamento::find($request->direcionamento_id);

          if ($direcionamento->atendimento_presencial) {
            $latestReagendamento->direcionamento_id = $request->direcionamento_id;
            $latestReagendamento->agenda_datetime = $request->data_agenda." ".$request->hora_agenda;
            $latestReagendamento->observacao_avaliador = $request->observacao_avaliador;
            $latestReagendamento->status = "aguardando-confirmacao";
            $latestReagendamento->avaliado_at = Carbon::now();
            $latestReagendamento->avaliador_id = Auth::user()->id;

            try {
              Mail::to($requerimento->email)->send(new ReagendamentoAgendadoMail($requerimento, $latestReagendamento));
              $latestReagendamento->envio_avaliacao = 1;
    
            } catch (Exception $e) {
              $latestReagendamento->envio_avaliacao = 0;
            }

          } else {
            $latestReagendamento->direcionamento_id = $request->direcionamento_id;
            $latestReagendamento->status = "confirmado";
            $latestReagendamento->observacao_avaliador = $request->observacao_avaliador;
            $latestReagendamento->avaliado_at = Carbon::now();
            $latestReagendamento->avaliador_id = Auth::user()->id;

            try {
              Mail::to($requerimento->email)->send(new ReagendamentoNaoPresencialMail($requerimento, $latestReagendamento));
              $latestReagendamento->envio_avaliacao = 1;

            } catch (Exception $e) {
              $latestReagendamento->envio_avaliacao = 0;
            }
          }
        }
        $latestReagendamento->save();

      } else {
        // Requerimento
        if ($request->direcionamento_id === "recusado") {
          $requerimento->status = "recusado";
          $requerimento->justificativa_recusa = $request->justificativa_recusa;
          $requerimento->observacao_avaliador = $request->observacao_avaliador;
          $requerimento->avaliado_at = Carbon::now();
          $requerimento->avaliador_id = Auth::user()->id;

          try {
            Mail::to($requerimento->email)->send(new RequerimentoRecusadoMail($requerimento));
            $requerimento->envio_avaliacao = 1;
          } catch (Exception $e) {
            $requerimento->envio_avaliacao = 0;
          }

        } else {
          $direcionamento = RequerimentoDirecionamento::find($request->direcionamento_id);

          if ($direcionamento->atendimento_presencial) {
            $requerimento->direcionamento_id = $request->direcionamento_id;
            $requerimento->agenda_datetime = $request->data_agenda." ".$request->hora_agenda;
            $requerimento->observacao_avaliador = $request->observacao_avaliador;
            $requerimento->status = "aguardando-confirmacao";
            $requerimento->avaliado_at = Carbon::now();
            $requerimento->avaliador_id = Auth::user()->id;

            try {
              Mail::to($requerimento->email)->send(new RequerimentoAgendadoMail($requerimento));
              $requerimento->envio_avaliacao = 1;
    
            } catch (Exception $e) {
              $requerimento->envio_avaliacao = 0;
            }

          } else {
            $requerimento->direcionamento_id = $request->direcionamento_id;
            $requerimento->status = "confirmado";
            $requerimento->observacao_avaliador = $request->observacao_avaliador;
            $requerimento->avaliado_at = Carbon::now();
            $requerimento->avaliador_id = Auth::user()->id;

            try {
              Mail::to($requerimento->email)->send(new RequerimentoNaoPresencialMail($requerimento));
              $requerimento->envio_avaliacao = 1;

            } catch (Exception $e) {
              $requerimento->envio_avaliacao = 0;
            }
          }
        }
      }

      $requerimento->last_movement_at = Carbon::now();
      $requerimento->save();
      DB::commit();
      return ["message" => "ok"];

    } catch (Exception $e) {
      DB::rollBack();
      return response()->json([ "message" => "error" ], 400);
    }
  }
  
  public function show($id) {
    $requerimento = Requerimento::with(
      "reagendamentos",
      "direcionamento",
      "atestado_files",
      "afastamento_files",
      "avaliador",
      "realocador"
    )->findOrFail($id);

    return $requerimento;
  }
  
  public function confirmacao(Request $request, $protocolo) {}
  
  public function presenca(Request $request, $id) {}

  public function realocacao(Request $request) {}

  public function query(Request $request) {
    $query = Requerimento::query();
    
    $query = $query->with(
      "reagendamentos",
      "direcionamento",
      "atestado_files",
      "afastamento_files",
      "avaliador",
      "realocador"
    );

    if ($request->section) {
      switch($request->section) {
        case "ativos":
          $query = $query
            ->whereIn("status", ["em-analise", "aguardando-confirmacao", "reagendamento-solicitado", "realocado"])
            ->orWhereHas("reagendamentos", function($q) {
              $q->whereIn("status", ["em-analise", "aguardando-confirmacao", "reagendamento-solicitado", "realocado"]);
            });
          break;

        case "diario":
          $query = $query
            ->whereBetween("agenda_datetime", [Carbon::now()->startOfDay(), Carbon::now()->endOfDay()])
            ->whereIn("status", ["confirmado", "aguardando-confirmacao", "reagendamento-solicitado"])
            ->orWhereHas("reagendamentos", function($q) {
              $q->whereBetween("agenda_datetime", [Carbon::now()->startOfDay(), Carbon::now()->endOfDay()])
              ->whereIn("status", ["confirmado"]);
            });
          break;

        case "arquivo":
          $query = $query
            ->whereIn("status", ["recusado", "confirmado"])
            ->orWhereHas("reagendamentos", function($q) {
              $q->whereIn("status", ["recusado", "confirmado"]);
            });
          break;
      }
    }

    if ($request->columnFilters) {
      foreach($request->columnFilters as $filter) {
        $query = $query->where($filter["id"], 'like', '%'.$filter["value"].'%')
        ->orWhereHas("reagendamentos", function($q) use ($filter) {
          $q->where($filter["id"], 'like', '%'.$filter["value"].'%');
        });
      }
    }

    if ($request->sorting) {
      foreach($request->sorting as $order) {
        $query = $query->orderBy($order["id"], $order["desc"] ? "desc" : "asc")
        ->orWhereHas("reagendamentos", function($q) use ($order) {
          $q->orderBy($order["id"], $order["desc"] ? "desc" : "asc");
        });
      }
    }

    $requerimentos = $query->paginate($request->per_page);

    return $requerimentos;
  }
}
