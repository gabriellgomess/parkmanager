<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Pagamentos;

class PagamentosController extends Controller
{
    public function index(Request $request)
    {
        $dataInicial = $request->input('startDate');
        $dataFinal = $request->input('endDate');

        // Construindo a consulta
        $pagamentos = Pagamentos::select(
            'datahoraentrada',
            'datahorasaida',
            'ticket',
            'valorpago',
            'nometarifa',
            'desconto',
            'operador',
            'placa',
            'descformadepagamento',
            'valorrecebido'
        )
        ->where('ticket', '>', 0)
        ->orderBy('datahoraentrada', 'desc');

        // Filtro por data
        if ($dataInicial && $dataFinal) {
            $pagamentos->whereBetween('datahoraentrada', [$dataInicial, $dataFinal]);
        } else {
            $pagamentos->whereBetween('datahoraentrada', [now()->subDays(30), now()]);
        }

        // Executando a consulta
        $resultados = $pagamentos->get();

        return response()->json($resultados);
    }
}
