<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;


class BlacklistController extends Controller
{
    public function getLogs(Request $request)
    {
        try {
            // $currentDate = date('Y-m-d'); // Data atual no formato YYYY-MM-DD
            $currentDate = '2024-12-16';

            // Consulta ao banco
            $resultados = DB::table('blacklist_logoperacoes')
                ->whereRaw("momento::text LIKE ?", ["$currentDate%"])
                ->orderBy('momento', 'desc')
                ->get();

            return response()->json($resultados);

        } catch (\Exception $e) {
            \Log::error("Erro na consulta: " . $e->getMessage());
            return response()->json(['error' => 'Erro ao buscar os dados.'], 500);
        }
    }
}
