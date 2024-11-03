<?php

namespace App\Http\Controllers;

use App\Models\LogHiper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LogHiperController extends Controller
{
    public function index(Request $request)
    {
        $dataInicial = $request->input('dataA');
        $dataFinal = $request->input('dataB');
        $ticket = $request->input('ticket');
        $placa = $request->input('placa');

        // Usa o modelo LogHiper e força a conexão 'pgsql' para a consulta
        $query = LogHiper::leftJoin('etetickets', 'log_hiper.ticket', '=', 'etetickets.ticket')
        ->leftJoin('etstickets', 'log_hiper.ticket', '=', 'etstickets.ticket')
        ->select(
            'log_hiper.*', 
            'etetickets.placa', 
            'etetickets.descricao as terminal_entrada', 
            'etstickets.descricao as terminal_saida'
        )
        ->orderBy('log_hiper.data', 'desc');

        // Aplica o filtro de data, se fornecido e se ticket ou placa não estão definidos
        if ($dataInicial && $dataFinal) {
        $query->whereBetween('log_hiper.datahoraentrada', [$dataInicial, $dataFinal]);
        } else if (!$ticket && !$placa) {
        // Aplica o filtro de 30 dias apenas quando não há filtros de ticket ou placa
        $query->whereBetween('log_hiper.datahoraentrada', [now()->subDays(30), now()]);
        }

        // Aplica o filtro de ticket, se fornecido
        if ($ticket) {
        $query->where('log_hiper.ticket', $ticket);
        }

        // Aplica o filtro de placa, se fornecido
        if ($placa) {
        $query->where('etetickets.placa', $placa);
        }


        $loghiper = $query->get();

        return response()->json($loghiper);
    }

    public function show($id)
    {
        $loghiper = LogHiper::find($id);

        if (!$loghiper) {
            return response()->json(['error' => 'Registro não encontrado'], 404);
        }

        return response()->json($loghiper);
    }
}

