<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Terminais extends Model
{
    use HasFactory;

    // Define a conexão para PostgreSQL
    protected $connection = 'pgsql';

    // Nome da tabela
    protected $table = 'ppmestacoes';

    // Permite operações em massa em todas as colunas
    protected $guarded = [];
}
