<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Pagamentos;
use Illuminate\Support\Facades\DB;

class PagamentosController extends Controller
{
    public function index(Request $request)
    {
        $dataInicial = $request->input('startDate');
        $dataFinal = $request->input('endDate');
        $ticket = $request->input('ticket');
        $statusPagamento = $request->input('status_pagamento');
        $desconto = $request->input('desconto');
        $order = $request->input('order');

        // Construindo a consulta principal
        $pagamentosQuery = DB::table('logrotativo as p')
            ->leftJoin('formadepagamento as fp', 'p.descformadepagamento', '=', 'fp.descricao')
            ->select(
                'p.datahoraentrada',
                'p.datahorasaida',
                'p.ticket',
                'p.valorpago',
                'p.nometarifa',
                'p.desconto',
                'p.operador',
                'p.placa',
                'p.descformadepagamento',
                'p.valorrecebido',
                DB::raw("CASE WHEN fp.descricao IS NOT NULL THEN 'pago' ELSE 'abononado' END as status_pagamento"),
                DB::raw("CASE WHEN p.desconto > 0 THEN 'true' ELSE 'false' END as possui_desconto") 
            )
            ->where('p.ticket', '>', 0);

        // Filtro por data
        if ($dataInicial && $dataFinal) {
            $pagamentosQuery->whereBetween('p.datahoraentrada', [$dataInicial.' 00:00:00', $dataFinal.' 23:59:59']);
        } else {
            $pagamentosQuery->whereBetween('p.datahoraentrada', [now()->startOfDay(), now()->endOfDay()]);
        }

        // Filtro por ticket
        if ($ticket) {
            $pagamentosQuery->where('p.ticket', $ticket);
        }

        // Subconsulta para permitir o filtro no status_pagamento
        $pagamentos = DB::table(DB::raw("({$pagamentosQuery->toSql()}) as subquery"))
            ->mergeBindings($pagamentosQuery) // Para manter os bindings da consulta original
            ->select('*');

        // Filtro por status_pagamento
        if ($statusPagamento) {
            $pagamentos->where('status_pagamento', $statusPagamento);
        }

        // Filtro por desconto
        if ($desconto === 'true') {
            $pagamentos->where('possui_desconto', 'true');
        } elseif ($desconto === 'false') {
            $pagamentos->where('possui_desconto', 'false');
        }

        // Ordenação
        $pagamentos->orderBy('datahoraentrada', $order);

        // Executando a consulta
        $resultados = $pagamentos->get();

        return response()->json($resultados);
    }




}
