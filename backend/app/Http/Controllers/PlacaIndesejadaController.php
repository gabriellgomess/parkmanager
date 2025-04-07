<?php

namespace App\Http\Controllers;

use App\Models\PlacaIndesejada;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PlacaIndesejadaController extends Controller
{
    public function index()
    {
        $placas = PlacaIndesejada::orderBy('created_at', 'desc')->get();
        return response()->json($placas);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'placa' => 'required|string|max:8',
            'motivo' => 'nullable|string|max:255',
            'marca_modelo' => 'nullable|string|max:255',
            'cor' => 'nullable|string|max:255'
        ]);
    
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
    
        if (PlacaIndesejada::where('placa', $request->placa)->exists()) {
            return response()->json(['error' => 'Placa já cadastrada.'], 409);
        }
    
        $data = $request->all();
        $data['cadastro'] = now();
        $data['usuario'] = auth()->user()->name ?? auth()->user()->email; // pega nome ou email
    
        $placa = PlacaIndesejada::create($data);
    
        return response()->json($placa, 201);
    }
    


    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'placa' => 'required|string|max:8',
            'motivo' => 'nullable|string|max:255',
            'marca_modelo' => 'nullable|string|max:255',
            'cor' => 'nullable|string|max:255'
        ]);
    
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
    
        $placa = PlacaIndesejada::findOrFail($id);
    
        $data = $request->all();
        $data['usuario'] = auth()->user()->name ?? auth()->user()->email;
    
        $placa->update($data);
    
        return response()->json($placa);
    }
    

    public function destroy($id)
    {
        $placa = PlacaIndesejada::findOrFail($id);
        $placa->delete();
        return response()->json(null, 204);
    }
}
