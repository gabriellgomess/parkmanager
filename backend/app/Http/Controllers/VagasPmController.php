<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\VagasPm;

class VagasPmController extends Controller
{
    // Método para obter o único registro de vagas
    public function show()
    {
        $vagas = VagasPm::first();

        if (!$vagas) {
            return response()->json(['message' => 'Capacidade ainda não definida'], 404);
        }

        return response()->json($vagas, 200);
    }

    // Método para editar o valor de vagas
    public function update(Request $request)
    {
        $request->validate([
            'vagas' => 'required|integer|min:1'
        ]);

        $vagas = VagasPm::first();

        if (!$vagas) {
            // Se ainda não existir um registro, cria um
            $vagas = VagasPm::create(['vagas' => $request->vagas]);
        } else {
            // Caso contrário, atualiza o existente
            $vagas->update(['vagas' => $request->vagas]);
        }

        return response()->json($vagas, 200);
    }
}
