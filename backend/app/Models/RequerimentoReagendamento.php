<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RequerimentoReagendamento extends Model
{
    use HasFactory;

    protected $fillable = [
      'requerimento_id',
      'justificativa_requerente',
      'envio_create',
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
      'status',
      'realocador_id',
      'justificativa_realocador',
      'realocado_at',
      'envio_realocacao',
    ];

    public function requerimento(): BelongsTo
    {
      return $this->belongsTo(Requerimento::class, 'requerimento_id');
    }

    public function direcionamento(): BelongsTo
    {
      return $this->belongsTo(RequerimentoDirecionamento::class, 'direcionamento_id');
    }

    public function avaliador(): BelongsTo
    {
      return $this->belongsTo(User::class, 'avaliador_id');
    }

    public function realocador(): BelongsTo
    {
      return $this->belongsTo(User::class, 'realocador_id');
    }
}
