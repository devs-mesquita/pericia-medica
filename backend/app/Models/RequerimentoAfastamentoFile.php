<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RequerimentoAfastamentoFile extends Model
{
    use HasFactory;

    protected $fillable = [
      'filename',
      'extension',
      'requerimento_id'
    ];

    public function requerimento(): BelongsTo
    {
      return $this->belongsTo(Requerimento::class, 'requerimento_id');
    }
}
