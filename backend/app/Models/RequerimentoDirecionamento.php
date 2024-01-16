<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class RequerimentoDirecionamento extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
      'name',
      'config',
      'atendimento_presencial',
      'deleted_at'
    ];

    public function requerimentos(): HasMany
    {
      return $this->hasMany(Requerimento::class);
    }

    public function reagendamentos(): HasMany
    {
      return $this->hasMany(RequerimentoReagendamento::class);
    }
}
