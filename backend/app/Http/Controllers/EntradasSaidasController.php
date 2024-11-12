<?php

namespace App\Http\Controllers;

use App\Models\EntradasSaidas;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class EntradasSaidasController extends Controller
{
    // Método para listar todas as entradas e saídas
    public function index(Request $request)
    {
        $dataInicial = $request->input('dataA');
        $dataFinal = $request->input('dataB');
        $ticket = $request->input('ticket');
        $placa = $request->input('placa');
        $permanenciaInicial = $request->input('permanenciaInicial');
        $permanenciaFinal = $request->input('permanenciaFinal');
    
        // Define a tabela principal explicitamente
        $query = EntradasSaidas::from('etetickets')
            ->leftJoin('etstickets', 'etetickets.ticket', '=', 'etstickets.ticket')
            ->select(
                'etetickets.data as etetickets_data',
                'etetickets.ticket as etetickets_ticket',
                'etetickets.placa as etetickets_placa',
                'etetickets.idterminal as etetickets_idterminal',
                'etetickets.entrada as etetickets_entrada',
                'etetickets.descricao as etetickets_descricao',
                'etetickets.cancel as etetickets_cancel',
                'etetickets.mensal as etetickets_mensal',
                'etetickets.cartaodebito as etetickets_cartaodebito',
                'etetickets.empresa as etetickets_empresa',
                'etetickets.garagem as etetickets_garagem',
                'etetickets.tipoveiculo as etetickets_tipoveiculo',
                'etetickets.tiposervico as etetickets_tiposervico',
                'etetickets.prisma as etetickets_prisma',
                'etetickets.mensalista as etetickets_mensalista',
                'etetickets.sequencia as etetickets_sequencia',
                'etetickets.setor as etetickets_setor',
                'etetickets.origemacesso as etetickets_origemacesso',
                'etetickets.comloopmotos as etetickets_comloopmotos',
                'etstickets.ticket as etstickets_ticket',
                'etstickets.data as etstickets_data',
                'etstickets.placa as etstickets_placa',
                'etstickets.dataentrada as etstickets_dataentrada',
                'etstickets.saida as etstickets_saida',
                'etstickets.descricao as etstickets_descricao',
                'etstickets.mensal as etstickets_mensal',
                'etstickets.permanencia as etstickets_permanencia',
                'etstickets.saiucomhiper as etstickets_saiucomhiper',
                'etstickets.setor as etstickets_setor',
                'etstickets.origemacesso as etstickets_origemacesso'
            )
            ->orderBy('etetickets.data', 'desc');
    
        // Aplica o filtro de data, se fornecido e se ticket ou placa não estão definidos
        if ($dataInicial && $dataFinal) {
            $query->whereBetween('etetickets.data', [$dataInicial, $dataFinal]);
        } else if (!$ticket && !$placa) {
            // Aplica o filtro de 7 dias apenas quando não há filtros de ticket ou placa
            $query->whereBetween('etetickets.data', [now()->subDays(7), now()]);
        }
    
        // Aplica o filtro de ticket, se fornecido
        if ($ticket) {
            $query->where('etetickets.ticket', $ticket);
        }
    
        // Aplica o filtro de placa, se fornecido
        if ($placa) {
            $query->where('etetickets.placa', $placa);
        }
    
        // Aplica o filtro de permanência, se fornecido
        if ($permanenciaInicial !== null && $permanenciaFinal !== null) {
            $query->whereBetween('etstickets.permanencia', [$permanenciaInicial, $permanenciaFinal]);
        }
        
    
        // Executa a consulta e retorna os resultados
        $entradasSaidas = $query->get();
    
        return response()->json($entradasSaidas);
    }
    
    
    // Método para buscar um registro específico pelo id
    public function show($id)
    {
        $entradaSaida = EntradasSaidas::find($id);

        if (!$entradaSaida) {
            return response()->json(['error' => 'Registro não encontrado'], 404);
        }

        return response()->json($entradaSaida);
    }
}
