<?php

namespace App\Models;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    public function getJWTIdentifier()
    {
      return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
      return [];
    }

    public function requerimentosAvaliados(): HasMany
    {
      return $this->hasMany(Requerimento::class, 'avaliador_id', 'id');
    }
    
    public function requerimentosRealocados(): HasMany
    {
      return $this->hasMany(Requerimento::class, 'realocador_id', 'id');
    }

    public function reagendamentosAvaliados(): HasMany
    {
      return $this->hasMany(RequerimentoReagendamento::class, 'avaliador_id', 'id');
    }
    
    public function reagendamentosRealocados(): HasMany
    {
      return $this->hasMany(RequerimentoReagendamento::class, 'realocador_id', 'id');
    }
}
