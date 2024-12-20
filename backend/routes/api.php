<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;

use App\Http\Controllers\EntradasSaidasController;
use App\Http\Controllers\LogHiperController;
use App\Http\Controllers\TerminaisController;
use App\Http\Controllers\CredenciadosController;
use App\Http\Controllers\CredenciadoAcessosController;
use App\Http\Controllers\PagamentosController;
use App\Http\Controllers\LotController;

// Rotas de Autenticação
Route::post("register", [AuthController::class, "register"]);
Route::post("login", [AuthController::class, "login"]);


// Rotas protegidas
Route::group(["middleware" => ["auth:sanctum"]], function () {
    Route::get("profile", [AuthController::class, "profile"]);
    Route::post("logout", [AuthController::class, "logout"]);

    // Rotas de Usuários (Apenas após autenticação)
    Route::get("users", [UserController::class, "index"]);
    Route::post("users", [UserController::class, "store"]);
    Route::put("users/{id}", [UserController::class, "update"]);
    Route::delete("users/{id}", [UserController::class, "destroy"]);

    // Rotas de Entradas e Saídas
    Route::get("entradas-saidas", [EntradasSaidasController::class, "index"]);
    Route::get('hiper', [LogHiperController::class, 'index']);
    Route::get('terminais', [TerminaisController::class, 'index']);

    // Rotas de Credenciados
    Route::get("credenciados", [CredenciadosController::class, "index"]);

    // Rotas de Credenciados Acessos
    Route::get("credenciado-acessos", [CredenciadoAcessosController::class, "index"]);

    // Rotas de Pagamentos
    Route::get("pagamentos", [PagamentosController::class, "index"]);

    // Rota para contagem de patio
    Route::get('patio', [LotController::class, 'countLots']);
    
});


