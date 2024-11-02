<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EntradasSaidas extends Model
{
    use HasFactory;

    // Define a conexão para PostgreSQL
    protected $connection = 'pgsql';

    // Nome da tabela
    protected $table = 'etetickets';

    // Permite operações em massa em todas as colunas (opcional)
    protected $guarded = []; // ou remova $fillable completamente
}
