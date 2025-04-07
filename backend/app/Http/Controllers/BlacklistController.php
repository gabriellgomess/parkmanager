<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class BlacklistController extends Controller
{
    /**
     * Retorna as ocorrências indesejadas do dia atual
     */
    public function listarOcorrenciasDoDia(Request $request)
    {
        try {
            $currentDate = date('Y-m-d');

            $ocorrencias = DB::table('bl_ocorrencias_indesejadas')
                ->whereRaw("datahora::text LIKE ?", ["$currentDate%"])
                ->orderByDesc('id')
                ->get();

            return response()->json($ocorrencias);

        } catch (\Exception $e) {
            \Log::error("Erro ao listar ocorrências indesejadas do dia: " . $e->getMessage());
            return response()->json(['error' => 'Erro ao buscar os dados.'], 500);
        }
    }

    /**
     * Retorna as últimas ocorrências indesejadas ainda não notificadas
     * e marca como processadas (via flag `notificado`)
     */
    public function getOcorrenciasLPR(Request $request)
    {
        try {
            $ocorrencias = DB::table('bl_ocorrencias_indesejadas')
                ->where('notificado', false)
                ->orderBy('id')
                ->limit(10)
                ->get();

            if ($ocorrencias->count() > 0) {
                DB::table('bl_ocorrencias_indesejadas')
                    ->whereIn('id', $ocorrencias->pluck('id'))
                    ->update(['notificado' => true]);
            }

            return response()->json($ocorrencias);

        } catch (\Exception $e) {
            \Log::error("Erro ao buscar novas ocorrências indesejadas: " . $e->getMessage());
            return response()->json(['error' => 'Erro ao buscar novas ocorrências.'], 500);
        }
    }
}
