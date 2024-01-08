<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Requerimento extends Model
{
    use HasFactory;

    protected $fillable = [
      'nome',
      'matricula',
      'protocolo',
      'local_lotacao',
      'email',
      'inicio_expediente',
      'fim_expediente',
      'inicio_atestado_date',
      'acumula_matricula',
      'status',
      'direcionamento_id',
      'agenda_datetime',
      'justificativa_recusa',
      'justificativa_realocacao',
      'observacao_avaliador',
      'confirmado_at',
      'avaliado_at',
      'envio_create',
      'envio_avaliacao',
      'reagendamento_solicitado_at',
      'presenca',
      'avaliador_id',
      'realocador_id',
      'realocado_at',
      'envio_realocacao',
      'last_movement_at',
    ];

    public function reagendamentos(): HasMany
    {
      return $this->hasMany(RequerimentoReagendamento::class, 'requerimento_id');
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
