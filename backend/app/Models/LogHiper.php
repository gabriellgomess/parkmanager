<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LogHiper extends Model
{
    use HasFactory;

    // Define a conexão para PostgreSQL
    protected $connection = 'pgsql';

    // Nome da tabela
    protected $table = 'log_hiper';

    // Permite operações em massa em todas as colunas (opcional)
    protected $guarded = []; // ou remova $fillable completamente
}
