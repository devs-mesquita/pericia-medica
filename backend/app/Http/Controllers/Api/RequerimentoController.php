<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Carbon;

use App\Models\User;

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
        'nome' => mb_strtoupper($request->nome),
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

      }

      try {
        Mail::to($requerimento->email)->send(new RequerimentoCreateMail($requerimento));
        $requerimento->envio_create = 1;
      } catch (\Exception $e) {
        $requerimento->envio_create = 0;
      }
      $requerimento->save();

      DB::commit();
      return response()->json([
        "protocolo" => $requerimento->protocolo,
        "message" => "new-requirement"
      ]);

    } catch (\Exception $e) {
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
  
          } catch (\Exception $e) {
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
    
            } catch (\Exception $e) {
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

            } catch (\Exception $e) {
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
          } catch (\Exception $e) {
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
    
            } catch (\Exception $e) {
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

            } catch (\Exception $e) {
              $requerimento->envio_avaliacao = 0;
            }
          }
        }
      }

      $requerimento->last_movement_at = Carbon::now();
      $requerimento->save();
      DB::commit();
      return ["message" => "ok"];

    } catch (\Exception $e) {
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
  
          } catch (\Exception $e) {
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
            
          } catch (\Exception $e) {
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
              ->whereIn("status", ["confirmado", "aguardando-confirmacao"])
              ->orWhereRelation("reagendamentos", function($q) {
                $q->whereBetween("agenda_datetime", [Carbon::now()->startOfDay(), Carbon::now()->endOfDay()])
                ->whereIn("status", ["confirmado", "aguardando-confirmacao"]);
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
              
            } catch (\Exception $e) {
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
              
            } catch (\Exception $e) {
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

    } catch (\Exception $e) {
      DB::rollBack();
      return response()->json(["message" => "error", "e" => $e], 400);
    }
  }

  public function relatorio(Request $request) {
    if (!$request->from || !$request->to) {
      return response()->json(["message" => "missing-daterange"], 400);
    }

    $from = Carbon::createFromFormat("Y-m-d", $request->from)->startOfDay();
    $to = Carbon::createFromFormat("Y-m-d", $request->to)->endOfDay();

    $requerimentos = Requerimento::with(
      "direcionamento",
      "reagendamentos",
      "reagendamentos.direcionamento"
    )
    ->where(function ($qry) use ($from, $to) {
      $qry->whereIn("status", ["confirmado"])
        ->whereBetween("agenda_datetime", [$from, $to])
        ->orWhereRelation("reagendamentos", function($q) use ($from, $to) {
          $q->whereIn("status", ["confirmado"])
          ->whereBetween("agenda_datetime", [$from, $to]);
        });
    })
    ->get();

    return [
      "requerimentos" => $requerimentos,
      "from" => $from,
      "to" => $to
    ];
  }

  public static function resendFailedEmails() {
    DB::beginTransaction();
    try {
      // get requerimentos where envio_create = 0 || envio_avaliacao = 0 || envio_realocacao = 0
      $requerimentos = Requerimento::with(
        "reagendamentos",
        "direcionamento",
        "reagendamentos.direcionamento"
        )->where("envio_create", 0)
        ->orWhere("envio_avaliacao", 0)
        ->orWhere("envio_realocacao", 0)
        ->get();
        
      // foreach, resend failed emails
      foreach($requerimentos as $requerimento) {
        if ($requerimento->envio_create === 0) {
          try {
            Mail::to($requerimento->email)->send(new RequerimentoCreateMail($requerimento));
            $requerimento->envio_create = 1;
    
          } catch (\Exception $e) {
            $requerimento->envio_create = 0;
          }
          $requerimento->save();
        }

        if ($requerimento->envio_avaliacao === 0) {
          if ($requerimento->status === "recusado") {
            try {
              Mail::to($requerimento->email)->send(new RequerimentoRecusadoMail($requerimento));
              $requerimento->envio_avaliacao = 1;
            } catch (\Exception $e) {
              $requerimento->envio_avaliacao = 0;
            }
            $requerimento->save();

          } else if ($requerimento->direcionamento->atendimento_presencial) {
            try {
              Mail::to($requerimento->email)->send(new RequerimentoAgendadoMail($requerimento));
              $requerimento->envio_avaliacao = 1;
    
            } catch (\Exception $e) {
              $requerimento->envio_avaliacao = 0;
            }
            $requerimento->save();

          } else if (!$requerimento->direcionamento->atendimento_presencial) {
            try {
              Mail::to($requerimento->email)->send(new RequerimentoNaoPresencialMail($requerimento));
              $requerimento->envio_avaliacao = 1;

            } catch (\Exception $e) {
              $requerimento->envio_avaliacao = 0;
            }
            $requerimento->save();
          }
        }
      }
      
      // get reagendamentos where envio_create = 0 || envio_avaliacao = 0 || envio_realocacao = 0
      $reagendamentos = RequerimentoReagendamento::with(
        "requerimento",
        "direcionamento",
        )->where("envio_create", 0)
        ->orWhere("envio_avaliacao", 0)
        ->orWhere("envio_realocacao", 0)
        ->get();
        
      // foreach, resend failed emails
      foreach($reagendamentos as $reagendamento) {
        if ($reagendamento->envio_create === 0) {
          $firstReagendamento = RequerimentoReagendamento::where("requerimento_id", $reagendamento->requerimento_id)->first();

          if ($firstReagendamento->id === $reagendamento->id) {
            if ($reagendamento->requerimento->realocado_at) {
              try {
                Mail::to($reagendamento->requerimento->email)->send(new RequerimentoRealocacaoMail($reagendamento->requerimento, $reagendamento));
                $reagendamento->requerimento->envio_realocacao = 1;
                $reagendamento->envio_create = 1;
                
              } catch (\Exception $e) {
                $reagendamento->envio_create = 0;
                $reagendamento->requerimento->envio_realocacao = 0;
              }
              $reagendamento->save();
              $reagendamento->requerimento->save();
              
            } else if ($reagendamento->requerimento->reagendamento_solicitado_at) {
              try {
                Mail::to($reagendamento->requerimento->email)->send(new ReagendamentoCreateMail($reagendamento->requerimento, $reagendamento));
                $reagendamento->envio_create = 1;
      
              } catch (\Exception $e) {
                $reagendamento->envio_create = 0;
              }
              $reagendamento->save();
            }

          } else {
            $upperReagendamento = RequerimentoReagendamento::where("requerimento_id", $reagendamento->requerimento_id)->where("id", "<", $reagendamento->id)->latest();

            if ($upperReagendamento->realocado_at) {
              try {
                Mail::to($reagendamento->requerimento->email)->send(new ReagendamentoRealocacaoMail($reagendamento->requerimento, $upperReagendamento, $reagendamento));
                $upperReagendamento->envio_realocacao = 1;
                $reagendamento->envio_create = 1;
                
              } catch (\Exception $e) {
                $upperReagendamento->envio_realocacao = 0;
                $reagendamento->envio_create = 0;
              }
              $upperReagendamento->save();
              $reagendamento->save();
              
            } else if ($upperReagendamento->reagendamento_solicitado_at) {
              try {
                Mail::to($reagendamento->requerimento->email)->send(new ReagendamentoCreateMail($reagendamento->requerimento, $reagendamento));
                $reagendamento->envio_create = 1;
      
              } catch (\Exception $e) {
                $reagendamento->envio_create = 0;
              }
              $reagendamento->save();
            }
          }
        }
        if ($reagendamento->envio_avaliacao === 0) {
          if ($reagendamento->status === "recusado") {
            try {
              Mail::to($reagendamento->requerimento->email)->send(new ReagendamentoRecusadoMail($reagendamento->requerimento, $reagendamento));
              $reagendamento->envio_avaliacao = 1;
            } catch (\Exception $e) {
              $reagendamento->envio_avaliacao = 0;
            }
            $reagendamento->save();

          } else if ($reagendamento->direcionamento->atendimento_presencial) {
            try {
              Mail::to($reagendamento->requerimento->email)->send(new ReagendamentoAgendadoMail($reagendamento->requerimento, $reagendamento));
              $reagendamento->envio_avaliacao = 1;
    
            } catch (\Exception $e) {
              $reagendamento->envio_avaliacao = 0;
            }
            $reagendamento->save();

          } else if (!$reagendamento->direcionamento->atendimento_presencial) {
            try {
              Mail::to($reagendamento->requerimento->email)->send(new ReagendamentoNaoPresencialMail($reagendamento->requerimento, $reagendamento));
              $reagendamento->envio_avaliacao = 1;

            } catch (\Exception $e) {
              $reagendamento->envio_avaliacao = 0;
            }
            $reagendamento->save();
          }
        }
      }

      DB::commit();
      return ["message" => "ok"];

    } catch (\Exception $e) {
      DB::rollBack();
      return response()->json(["message" => "error", "e" => $e]);
    }
  }

  public function migrateData(Request $request)
  {
    $users = DB::connection("mysql_old")->select("select * from users");
    foreach($users as $user) {
      $newUser = new User;
      $newUser->id = $user->id;
      $newUser->name = mb_strtoupper($user->name);
      $newUser->email = $user->email;
      $newUser->role = $user->nivel;
      $newUser->password = $user->password;
      $newUser->created_at = $user->created_at;
      $newUser->updated_at = $user->updated_at;
      $newUser->save();
    }
    
    $direcionamentos = DB::connection("mysql_old")->select("select * from direcionamentos");
    foreach($direcionamentos as $direcionamento) {
      $newDirecionamento = new RequerimentoDirecionamento;
      $newDirecionamento->id = $direcionamento->id;
      $newDirecionamento->name = mb_strtoupper($direcionamento->nome);
      $newDirecionamento->atendimento_presencial = 1;
      $newDirecionamento->created_at = $direcionamento->created_at;
      $newDirecionamento->updated_at = $direcionamento->updated_at;
      
      $oldConfig = json_decode($direcionamento->config);
      $newDirecionamento->config = json_encode([
        [
          "weekdayIndex" => 0,
          "weekday" => "Domingo",
          "start" => $oldConfig[0]->inicio,
          "isEnabled" => $oldConfig[0]->isOn === 1 ? true : false,
          "end" => $oldConfig[0]->fim,
        ],
        [
          "weekdayIndex" => 1,
          "weekday" => "Segunda",
          "start" => $oldConfig[1]->inicio,
          "isEnabled" => $oldConfig[1]->isOn === 1 ? true : false,
          "end" => $oldConfig[1]->fim,
        ],
        [
          "weekdayIndex" => 2,
          "weekday" => "Terça",
          "start" => $oldConfig[2]->inicio,
          "isEnabled" => $oldConfig[2]->isOn === 1 ? true : false,
          "end" => $oldConfig[2]->fim,
        ],
        [
          "weekdayIndex" => 3,
          "weekday" => "Quarta",
          "start" => $oldConfig[3]->inicio,
          "isEnabled" => $oldConfig[3]->isOn === 1 ? true : false,
          "end" => $oldConfig[3]->fim,
        ],
        [
          "weekdayIndex" => 4,
          "weekday" => "Quinta",
          "start" => $oldConfig[4]->inicio,
          "isEnabled" => $oldConfig[4]->isOn === 1 ? true : false,
          "end" => $oldConfig[4]->fim,
        ],
        [
          "weekdayIndex" => 5,
          "weekday" => "Sexta",
          "start" => $oldConfig[5]->inicio,
          "isEnabled" => $oldConfig[5]->isOn === 1 ? true : false,
          "end" => $oldConfig[5]->fim,
        ],
        [
          "weekdayIndex" => 6,
          "weekday" => "Sábado",
          "start" => $oldConfig[6]->inicio,
          "isEnabled" => $oldConfig[6]->isOn === 1 ? true : false,
          "end" => $oldConfig[6]->fim,
        ],
      ]);

      $newDirecionamento->save();
    }
    $covid = new RequerimentoDirecionamento;
    $covid->id = 4;
    $covid->config = '[{"end": null, "start": null, "weekday": "Domingo", "isEnabled": false, "weekdayIndex": 0}, {"end": null, "start": null, "weekday": "Segunda", "isEnabled": false, "weekdayIndex": 1}, {"end": null, "start": null, "weekday": "Terça", "isEnabled": false, "weekdayIndex": 2}, {"end": null, "start": null, "weekday": "Quarta", "isEnabled": false, "weekdayIndex": 3}, {"end": null, "start": null, "weekday": "Quinta", "isEnabled": false, "weekdayIndex": 4}, {"end": null, "start": null, "weekday": "Sexta", "isEnabled": false, "weekdayIndex": 5}, {"end": null, "start": null, "weekday": "Sábado", "isEnabled": false, "weekdayIndex": 6}]';
    $covid->name = "COVID";
    $covid->atendimento_presencial = 0;
    $covid->created_at = Carbon::now();
    $covid->updated_at = Carbon::now();
    $covid->save();

    $statuses = [
      "em-analise",
      "recusado",
      "",
      "aguardando-confirmacao",
      "confirmado",
      "reagendamento-solicitado"
    ];

    $direcionamentosArr = [
      "Atendimento Pericial" => 1,
      "Avaliação Psiquiátrica" => 2,
      "Junta Médica" => 3,
      "COVID" => 4
    ];

    $requerimentos = DB::connection("mysql_old")->select("select * from requerimento_pericias");
    foreach($requerimentos as $requerimento) {
      $newRequerimento = new Requerimento;
      $newRequerimento->id = $requerimento->id;
      $newRequerimento->nome = mb_strtoupper($requerimento->nome);
      $newRequerimento->matricula = $requerimento->matricula;
      $newRequerimento->protocolo = $requerimento->protocolo;
      $newRequerimento->local_lotacao = $requerimento->local_lotacao;
      $newRequerimento->inicio_expediente = explode(" ", $requerimento->horario_trabalho)[0];
      $newRequerimento->fim_expediente = explode(" ", $requerimento->horario_trabalho)[2];
      $newRequerimento->inicio_atestado_date = Carbon::createFromFormat("d/m/Y", $requerimento->dt_inicio_atestado)->toDateString();
      $newRequerimento->email = $requerimento->email;
      $newRequerimento->acumula_matricula = $requerimento->vinculo === "Sim" ? true : false;
      $newRequerimento->last_movement_at = $requerimento->updated_at;
      $newRequerimento->envio_create = 1;
      $newRequerimento->presenca = $requerimento->presenca === -1 ? null : $requerimento->presenca;
      $newRequerimento->observacao_avaliador = $requerimento->observacao;
      if ($requerimento->user_id) {
        $newRequerimento->avaliador_id = $requerimento->user_id;
      }

      if ($requerimento->direcionamento && $requerimento->direcionamento !== "Recusado") {
        $newRequerimento->direcionamento_id = $direcionamentosArr[$requerimento->direcionamento];
      }
      if (strlen($requerimento->data_agenda) > 1 && strlen($requerimento->hora_agenda) > 1) {
        $newRequerimento->agenda_datetime = Carbon::createFromFormat("Y-m-d H:i:s", explode(" ", $requerimento->data_agenda)[0]." ".$requerimento->hora_agenda.":00");
      }

      if ($requerimento->justificativa_reagenda) {
        /* Create Reagendamento */
        $newReagendamento = new RequerimentoReagendamento;
        $newReagendamento->requerimento_id = $requerimento->id;
        $newRequerimento->status = "reagendamento-solicitado";
        if (strlen($requerimento->data_pedidoreagenda) > 1) {
          $newRequerimento->reagendamento_solicitado_at = Carbon::createFromFormat("d/m/Y", explode(" ", $requerimento->data_pedidoreagenda)[0]);
        }
        $newReagendamento->justificativa_requerente = $requerimento->justificativa_reagenda;
        $newReagendamento->envio_create = 1;

        /* Avaliado */
        if ($requerimento->data_reagenda) {
          if (strlen($requerimento->data_reagenda) > 1) {
            $newReagendamento->avaliado_at = Carbon::createFromFormat("d/m/Y", explode(" ", $requerimento->data_reagenda)[0]);
          }

          if ($requerimento->user_id) {
            $newReagendamento->avaliador_id = $requerimento->user_id;
          }
          $newReagendamento->observacao_avaliador = $requerimento->observacao_reagenda;
          $newReagendamento->envio_avaliacao = 1;
          
          if ($statuses[$requerimento->status] === "recusado" || $requerimento->direcionamento === "Recusado") {
            $newReagendamento->observacao_avaliador = $requerimento->observacao_reagenda;
            $newReagendamento->justificativa_recusa = $requerimento->motivo_recusa;
            if ($requerimento->user_id) {
              $newReagendamento->avaliador_id = $requerimento->user_id;
            }
            $newReagendamento->status = "recusado";
          } else {
            $newReagendamento->direcionamento_id = $direcionamentosArr[$requerimento->direcionamento];
            if (strlen($requerimento->data_reagendada) > 1) {
              $newReagendamento->agenda_datetime = Carbon::createFromFormat("Y-m-d H:i:s", explode(" ", $requerimento->data_reagendada)[0]." ".$requerimento->hora_reagendada.":00");
            }
            $newReagendamento->status = $statuses[$requerimento->status];
            if ($statuses[$requerimento->status] === "confirmado") {
              if (strlen($requerimento->data_confirmacaoreagenda) > 1) {
                $newReagendamento->confirmado_at = Carbon::createFromFormat("d/m/Y", explode(" ", $requerimento->data_confirmacaoreagenda)[0]);
              }
            }
          }
        } else {
          if ($statuses[$requerimento->status] === "reagendamento-solicitado") {
            $newReagendamento->envio_create = 1;
            $newReagendamento->status = "em-analise";
          }
        }

      } else {
        /* Main Requerimento Only */
        if ($requerimento->direcionamento) {
          if ($requerimento->direcionamento === "Recusado") {
            $newRequerimento->status = "recusado";
            $newRequerimento->justificativa_recusa = $requerimento->motivo_recusa;
            if (strlen($requerimento->data_avaliacao) > 1) {
              $newRequerimento->avaliado_at = Carbon::createFromFormat("d/m/Y", explode(" ", $requerimento->data_avaliacao)[0]);
            }
            $newRequerimento->envio_avaliacao = 1;
            
          } else {
            $newRequerimento->status = $statuses[$requerimento->status];
            if (strlen($requerimento->data_confirmacao) > 1) {
              $newRequerimento->confirmado_at = Carbon::createFromFormat("d/m/Y", explode(" ", $requerimento->data_confirmacao)[0]);
            }
          }
          
        } else {
          $newRequerimento->status = "em-analise";
        }
      }

      $newRequerimento->save();
      if (isset($newReagendamento)) {
        $newReagendamento->save();
      }
    }

    $atestados = DB::connection("mysql_old")->select("select * from documento_atestados");
    foreach($atestados as $atestado) {
      $newAtestado = new RequerimentoAtestadoFile;
      $newAtestado->requerimento_id = $atestado->requerimento_id;
      $newAtestado->filename = $atestado->filename;
      $newAtestado->extension = $atestado->extensao;
      $newAtestado->created_at = $atestado->created_at;
      $newAtestado->updated_at = $atestado->updated_at;
      $newAtestado->save();
    }
    
    $afastamentos = DB::connection("mysql_old")->select("select * from documento_afastamentos");
    foreach($afastamentos as $afastamento) {
      $newAfastamento = new RequerimentoAfastamentoFile;
      $newAfastamento->requerimento_id = $afastamento->requerimento_id;
      $newAfastamento->filename = $afastamento->filename;
      $newAfastamento->extension = $afastamento->extensao;
      $newAfastamento->created_at = $afastamento->created_at;
      $newAfastamento->updated_at = $afastamento->updated_at;
      $newAfastamento->save();
    }

    return ["message" => "ok"];
  }

  public function updateData ()
  {
    DB::beginTransaction();
    try {
      $requerimentos = Requerimento::get();

      foreach ($requerimentos as $requerimento) {
        $oldReq = DB::connection("mysql_old")
        ->select("select * from requerimento_pericias where protocolo = '".$requerimento->protocolo."';");

        if (count($oldReq) === 0) {
          continue;
        }

        $requerimento->created_at = $oldReq[0]->created_at;
        $requerimento->save();
      }
      DB::commit();
      return ["message" => "ok"];

    } catch (\Exception $e) {
      DB::rollBack();
      return $e;
    }
  }
}
