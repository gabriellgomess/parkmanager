<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;

class LotController extends Controller
{
    public function countLots()
    {
        // Executa a consulta no banco de dados
        $count = DB::table('lot')->count();

        // Retorna o resultado como JSON
        return response()->json(['patio' => $count]);
    }
}
