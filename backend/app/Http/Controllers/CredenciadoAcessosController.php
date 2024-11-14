<?php

namespace App\Http\Controllers;
use App\Models\CredenciadoAcessos;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;


class CredenciadoAcessosController extends Controller
{
    public function index(Request $request)
    {
        $cartao = $request->input('cartao');

        // Usa o modelo CredenciadoAcessos e força a conexão 'pgsql' para a consulta
        $query = CredenciadoAcessos::from('etetickets')
        ->leftJoin('etstickets', function ($join) {
            $join->on(DB::raw("COALESCE(SPLIT_PART(etstickets.ticket, ':', 2), etstickets.ticket)"), '=', 'etetickets.ticket')
                 ->orOn('etetickets.placa', '=', 'etstickets.placa');
        })
        
        ->select(
            'etetickets.data as etetickets_id',
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
        ->orderBy('etetickets.data', 'desc')
        ->where('etetickets.ticket', $cartao)
        ->where('etstickets.mensal', 'T');    


        $credenciadoAcessos = $query->get();

        return response()->json($credenciadoAcessos);
    }
}
