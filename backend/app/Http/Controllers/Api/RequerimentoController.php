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
use App\Mail\RequerimentoRealocacaoMail;

use App\Mail\ReagendamentoCreateMail;
use App\Mail\ReagendamentoAgendadoMail;
use App\Mail\ReagendamentoNaoPresencialMail;
use App\Mail\ReagendamentoRecusadoMail;
use App\Mail\ReagendamentoRealocacaoMail;

class RequerimentoController extends Controller
{
  public function index(Request $request) {
    $requerimentos = Requerimento::doesntHave("reagendamentos")->get();

    $withReagendamentos = Requerimento::with(["reagendamentos" => function($query) {
      $query->orderBy("created_at", "desc");
    }])
    ->has("reagendamentos")
    ->get()->toArray();

    $reagendamentos = array_map(function ($requerimento) {      
      return $requerimento["reagendamentos"][0];
    }, $withReagendamentos);

    $requerimentosRealocados = Requerimento::whereIn("status", ["reagendamento-solicitado", "realocado"])->get();
    $reagendamentosRealocados = RequerimentoReagendamento::whereIn("status", ["reagendamento-solicitado", "realocado"])->get();

    return [
      "requerimentos" => $requerimentos,
      "reagendamentos" => $reagendamentos,
      "requerimentosRealocados" => $requerimentosRealocados,
      "reagendamentosRealocados" => $reagendamentosRealocados
    ];
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
        'last_movement_at' => Carbon::now()
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
      $requerimento = Requerimento::with("reagendamentos")->find($id);

      if(!$requerimento) {
        return response()->json(["message" => "not-found"], 404);
      }
      
      // Reagendamento
      if ($requerimento->reagendamentos->count() > 0) {
        $latestReagendamento = $requerimento->reagendamentos[$requerimento->reagendamentos->count()-1];
        if ($latestReagendamento->status !== "em-analise") {
          return response()->json(["message" => "bad-request"], 400);
        }

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
        if ($requerimento->status !== "em-analise") {
          return response()->json(["message" => "bad-request"], 400);
        }

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
      "reagendamentos.direcionamento",
      "reagendamentos.avaliador",
      "reagendamentos.realocador",
      "direcionamento",
      "atestado_files",
      "afastamento_files",
      "avaliador",
      "realocador"
    )->find($id);

    if (!$requerimento) {
      return response()->json(["message" => "not-found"], 404);
    }

    return $requerimento;
  }
  
  public function confirmacao(Request $request, $protocolo) {
    if (!$request->opcao) {
      return response()->json(["message" => "bad-request"], 400);
    }

    if (!in_array($request->opcao, ["confirmar", "solicitar-reagendamento"])) {
      return response()->json(["message" => "bad-request"], 400);
    }

    DB::beginTransaction();
    $requerimento = Requerimento::with("reagendamentos")->where("protocolo", $protocolo)->first();

    if (!$requerimento) {
      return response()->json(["message" => "not-found"], 404);
    }

    if ($requerimento->reagendamentos->count() > 0) {
      $latestReagendamento = $requerimento->reagendamentos[$requerimento->reagendamentos->count()-1];

      if ($latestReagendamento->status === "confirmado") {
        return ["message" => "already-confirmado", "protocolo" => $requerimento->protocolo];
      }

      if ($latestReagendamento->status === "recusado") {
        return ["message" => "recusado", "protocolo" => $requerimento->protocolo];
      }

      if ($latestReagendamento->status === "em-analise") {
        return ["message" => "em-analise", "protocolo" => $requerimento->protocolo];
      }

      if ($latestReagendamento->status === "aguardando-confirmacao") {
        if ($request->opcao === "confirmar") {
          $latestReagendamento->status = "confirmado";
          $latestReagendamento->confirmado_at = Carbon::now();
          $latestReagendamento->save();

        } else if ($request->opcao === "solicitar-reagendamento") {
          $latestReagendamento->status = "reagendamento-solicitado";
          $latestReagendamento->reagendamento_solicitado_at = Carbon::now();
          $latestReagendamento->save();

          $newReagendamento = new RequerimentoReagendamento;
          $newReagendamento->justificativa_requerente = $request->justificativa_requerente;
          $newReagendamento->status = "em-analise";
          $newReagendamento->requerimento_id = $requerimento->id;

          try {
            Mail::to($requerimento->email)->send(new ReagendamentoCreateMail($requerimento, $newReagendamento));
            $newReagendamento->envio_create = 1;
  
          } catch (Exception $e) {
            $newReagendamento->envio_create = 0;
          }

          $newReagendamento->save();
        }

        $requerimento->last_movement_at = Carbon::now();
        $requerimento->save();
        DB::commit();
        return ["message" => "ok", "opcao" => $request->opcao, "protocolo" => $requerimento->protocolo];
      }
    } else {
      if ($requerimento->status === "confirmado") {
        return ["message" => "already-confirmado", "protocolo" => $requerimento->protocolo];
      }

      if ($requerimento->status === "recusado") {
        return ["message" => "recusado", "protocolo" => $requerimento->protocolo];
      }

      if ($requerimento->status === "em-analise") {
        return ["message" => "em-analise", "protocolo" => $requerimento->protocolo];
      }

      if ($requerimento->status === "aguardando-confirmacao") {
        if ($request->opcao === "confirmar") {
          $requerimento->status = "confirmado";
          $requerimento->confirmado_at = Carbon::now();
          $requerimento->save();

        } else if ($request->opcao === "solicitar-reagendamento") {
          $requerimento->status = "reagendamento-solicitado";
          $requerimento->reagendamento_solicitado_at = Carbon::now();
          $requerimento->save();

          $newReagendamento = new RequerimentoReagendamento;
          $newReagendamento->justificativa_requerente = $request->justificativa_requerente;
          $newReagendamento->status = "em-analise";
          $newReagendamento->requerimento_id = $requerimento->id;

          try {
            Mail::to($requerimento->email)->send(new ReagendamentoCreateMail($requerimento, $newReagendamento));
            $newReagendamento->envio_create = 1;
            
          } catch (Exception $e) {
            $newReagendamento->envio_create = 0;
          }
          
          $newReagendamento->save();
        }

        $requerimento->last_movement_at = Carbon::now();
        $requerimento->save();
        DB::commit();
        return ["message" => "ok", "opcao" => $request->opcao, "protocolo" => $requerimento->protocolo];
      }
    }
  }
  
  public function presenca(Request $request, $id) {
    $requerimento = Requerimento::with("reagendamentos")->findOrFail($id);

    if ($requerimento->reagendamentos->count() > 0) {
      $latestReagendamento = $requerimento->reagendamentos[$requerimento->reagendamentos->count()-1];
      
      $latestReagendamento->presenca = $request->presenca;
      $latestReagendamento->confirmado_at = Carbon::now();
      $latestReagendamento->status = "confirmado";
      $latestReagendamento->save();
    } else {
      $requerimento->confirmado_at = Carbon::now();
      $requerimento->presenca = $request->presenca;
      $requerimento->status = "confirmado";
    }

    $requerimento->last_movement_at = Carbon::now();
    $requerimento->save();

    return ["message" => "ok", "presenca" => $request->presenca];
  }

  public function realocacao(Request $request) {}

  public function query(Request $request) {
    $query = Requerimento::query();
    
    $query = $query->with([
      "reagendamentos",
      "reagendamentos.avaliador",
      "reagendamentos.realocador",
      "reagendamentos.direcionamento",
      "direcionamento",
      "atestado_files",
      "afastamento_files",
      "avaliador",
      "realocador"
    ]);

    $sorting = $request?->sorting;
    $columnFilters = $request?->columnFilters;
    $section = $request?->section;

    $reagendamento_keys = [
      'id',
      'requerimento_id',
      'justificativa_requerente',
      'envio_create',
      'status',
      'observacao_avaliador',
      'justificativa_recusa',
      'avaliado_at',
      'avaliador_id',
      'direcionamento_id',
      'envio_avaliacao',
      'agenda_datetime',
      'confirmado_at',
      'reagendamento_solicitado_at',
      'presenca',
      'realocador_id',
      'justificativa_realocacao',
      'realocado_at',
      'envio_realocacao'
    ];

    if ($section) {
      switch($section) {
        case "ativos":
          $query = $query->where(function ($qry) {
              $qry->whereIn("status", ["em-analise", "aguardando-confirmacao", "reagendamento-solicitado", "realocado"])
              ->orWhereRelation("reagendamentos", function($q) {
                $q->whereIn("status", ["em-analise", "aguardando-confirmacao", "reagendamento-solicitado", "realocado"]);
              });
            })->whereDoesntHave("reagendamentos", function($q) {
              $q->whereIn("status", ["recusado", "confirmado"]);
            });
          break;

        case "diario":
          $query = $query->where(function ($qry) {
            $qry->whereBetween("agenda_datetime", [Carbon::now()->startOfDay(), Carbon::now()->endOfDay()])
              ->whereIn("status", ["confirmado"])
              ->orWhereRelation("reagendamentos", function($q) {
                $q->whereBetween("agenda_datetime", [Carbon::now()->startOfDay(), Carbon::now()->endOfDay()])
                ->whereIn("status", ["confirmado"]);
              });
          });
          break;

        case "arquivo":
          $query = $query->where(function ($qry) {
            $qry->whereIn("status", ["recusado", "confirmado"])
              ->orWhereRelation("reagendamentos", function($q) {
                $q->whereIn("status", ["recusado", "confirmado"]);
              });
          });
          break;
      }
    }

    if ($columnFilters) {
      foreach($columnFilters as $filter) {
        if (in_array($filter["id"], $reagendamento_keys)) {
          $query = $query->where(function ($qry) use ($filter) {
            $qry->where($filter["id"], 'like', '%'.$filter["value"].'%')
              ->orWhereRelation("reagendamentos", function($q) use ($filter) {
                $q->where($filter["id"], 'like', '%'.$filter["value"].'%');
              });
            });
        } else {
          $query = $query->where($filter["id"], 'like', '%'.$filter["value"].'%');
        }
      }
    }

    if ($sorting) {
      foreach($sorting as $order) {
        $query = $query->orderBy($order["id"], $order["desc"] ? "desc" : "asc");
      }
    }

    $requerimentos = $query->paginate($request->per_page);
    return $requerimentos;
  }

  public function getRealocacoes(Request $request) {
    $start = Carbon::createFromFormat("Y-m-d", $request->dataCancelada)->startOfDay();
    $end = Carbon::createFromFormat("Y-m-d", $request->dataCancelada)->endOfDay();

    $requerimentos = DB::table("requerimentos")
      ->select(DB::raw('count(*) as quantidade, requerimento_direcionamentos.id as direcionamento_id, requerimento_direcionamentos.name as direcionamento_name'))
      ->join("requerimento_direcionamentos", "requerimentos.direcionamento_id", "=", "requerimento_direcionamentos.id")
      ->whereBetween("agenda_datetime", [$start, $end])
      ->whereIn("status", ["aguardando-confirmacao", "confirmado"])
      ->groupBy("direcionamento_id")
      ->get();

    $reagendamentos = DB::table("requerimento_reagendamentos")
      ->join("requerimento_direcionamentos", "requerimento_reagendamentos.direcionamento_id", "=", "requerimento_direcionamentos.id")
      ->select(DB::raw('count(*) as quantidade, requerimento_direcionamentos.id as direcionamento_id, requerimento_direcionamentos.name as direcionamento_name'))
      ->groupBy("direcionamento_id")
      ->whereBetween("agenda_datetime", [$start, $end])
      ->whereIn("status", ["aguardando-confirmacao", "confirmado"])
      ->get();

    return [ "realocacoes" => [
        ...$requerimentos,
        ...$reagendamentos
      ]
    ];
  }

  public function applyRealocacoes(Request $request) {
    $start = Carbon::createFromFormat("Y-m-d", $request->dataCancelada)->startOfDay();
    $end = Carbon::createFromFormat("Y-m-d", $request->dataCancelada)->endOfDay();
    $dataAtual = Carbon::now();

    DB::beginTransaction();
    try {
      foreach ($request->realocacoes as $direcionamento_id => $realocacao) {
        if ($realocacao["realocar"]) {
          $requerimentos = Requerimento::whereBetween("agenda_datetime", [$start, $end])
            ->whereIn("status", ["aguardando-confirmacao", "confirmado"])
            ->where("direcionamento_id", $direcionamento_id)
            ->get();

          $reagendamentos = RequerimentoReagendamento::whereBetween("agenda_datetime", [$start, $end])
          ->whereIn("status", ["aguardando-confirmacao", "confirmado"])
          ->where("direcionamento_id", $direcionamento_id)
            ->get();

          foreach($requerimentos as $requerimento) {
            $newDate = null;

            if ($realocacao["manterHorario"]) {
              $newDate = Carbon::createFromFormat("Y-m-d H:i:s", $request->novaData." ".explode(" ", $requerimento->agenda_datetime)[1]);
            } else {
              $newDate = Carbon::createFromFormat("Y-m-d H:i:s", $request->novaData." ".$realocacao["novoHorario"].":00");
            }

            $newRealocacao = new RequerimentoReagendamento;
            $newRealocacao->requerimento_id = $requerimento->id;
            $newRealocacao->direcionamento_id = $requerimento->direcionamento_id;
            $newRealocacao->agenda_datetime = $newDate;
            $newRealocacao->status = "aguardando-confirmacao";
            $newRealocacao->save();

            $requerimento->status = "realocado";
            $requerimento->realocador_id = Auth::user()->id;
            $requerimento->justificativa_realocacao = $request->justificativaRealocacao;
            $requerimento->realocado_at = $dataAtual;
            $requerimento->last_movement_at = $dataAtual;
            
            try {
              Mail::to($requerimento->email)->send(new RequerimentoRealocacaoMail($requerimento, $newRealocacao));
              $requerimento->envio_realocacao = 1;
              $newRealocacao->envio_create = 1;
              
            } catch (Exception $e) {
              $newRealocacao->envio_create = 0;
              $requerimento->envio_realocacao = 0;
            }
            $newRealocacao->save();
            $requerimento->save();
          }

          foreach($reagendamentos as $reagendamento) {
            $requerimento = Requerimento::find($reagendamento->requerimento_id);
            $newDate = null;

            if ($realocacao["manterHorario"]) {
              $newDate = Carbon::createFromFormat("Y-m-d H:i:s", $request->novaData." ".explode(" ", $reagendamento->agenda_datetime)[1]);
            } else {
              $newDate = Carbon::createFromFormat("Y-m-d H:i:s", $request->novaData." ".$realocacao["novoHorario"].":00");
            }

            $newRealocacao = new RequerimentoReagendamento;
            $newRealocacao->requerimento_id = $reagendamento->requerimento_id;
            $newRealocacao->direcionamento_id = $reagendamento->direcionamento_id;
            $newRealocacao->agenda_datetime = $newDate;
            $newRealocacao->status = "aguardando-confirmacao";
            $newRealocacao->save();

            $reagendamento->status = "realocado";
            $reagendamento->realocado_at = $dataAtual;
            $reagendamento->realocador_id = Auth::user()->id;
            $reagendamento->justificativa_realocacao = $request->justificativaRealocacao;
            
            $requerimento->last_movement_at = $dataAtual;
            
            try {
              Mail::to($requerimento->email)->send(new ReagendamentoRealocacaoMail($requerimento, $reagendamento, $newRealocacao));
              $reagendamento->envio_realocacao = 1;
              $newRealocacao->envio_create = 1;
              
            } catch (Exception $e) {
              $reagendamento->envio_realocacao = 0;
              $newRealocacao->envio_create = 0;
            }
            $newRealocacao->save();
            $reagendamento->save();
            $requerimento->save();
          }
        }
      }

      DB::commit();
      return ["message" => "ok"];

    } catch (Exception $e) {
      DB::rollBack();
      return response()->json(["message" => "error", "e" => $e], 400);
    }
  }
}
