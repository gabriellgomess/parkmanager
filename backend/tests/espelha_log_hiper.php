<?php

// debug
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Configurações de conexão com o PostgreSQL
$pgsqlHost = '125.125.10.100';
$pgsqlPort = '5432';
$pgsqlDbName = 'parkingplus';
$pgsqlUser = 'postgres';
$pgsqlPassword = 'postgres';
$pgsqlTable = 'log_hiper';

// Configurações de conexão com o MySQL
$mysqlHost = '185.213.81.205';
$mysqlDbName = 'u362384337_peoplemanager';
$mysqlUser = 'u362384337_peoplemanager';
$mysqlPassword = 'Isadopai12345@';
$mysqlTable = 'validacao_hiper';

// Último ID processado
$lastProcessedFile = '/instalacoes/last_processed_id.txt';
$lastProcessedId = file_exists($lastProcessedFile) ? (int)file_get_contents($lastProcessedFile) : 0;

// Definir a data inicial para a consulta
$dataInicio = '2024-11-25 00:00:00';

try {
    // Conexão com PostgreSQL
    try {
        $pgsql = new PDO("pgsql:host=$pgsqlHost;port=$pgsqlPort;dbname=$pgsqlDbName", $pgsqlUser, $pgsqlPassword);
        $pgsql->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    } catch (PDOException $e) {
        error_log("Erro ao conectar ao PostgreSQL: " . $e->getMessage());
        die("Erro ao conectar ao banco de dados PostgreSQL. Verifique as configurações.");
    }

    // Conexão com MySQL
    try {
        $mysql = new PDO("mysql:host=$mysqlHost;dbname=$mysqlDbName;charset=utf8", $mysqlUser, $mysqlPassword);
        $mysql->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    } catch (PDOException $e) {
        error_log("Erro ao conectar ao MySQL: " . $e->getMessage());
        die("Erro ao conectar ao banco de dados MySQL. Verifique as configurações.");
    }

    // Buscar registros novos no PostgreSQL a partir de uma data específica
    $stmt = $pgsql->prepare("
        SELECT * 
        FROM $pgsqlTable 
        WHERE id > :lastProcessedId 
          AND datahoraentrada >= :dataInicio
        ORDER BY id ASC
    ");
    $stmt->execute([
        ':lastProcessedId' => $lastProcessedId,
        ':dataInicio' => $dataInicio
    ]);
    $newRecords = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $data_hora_atual = date('Y-m-d H:i:s', strtotime('-3 hours'));

    if (count($newRecords) > 0) {
        // Inserir registros no MySQL
        $insertQuery = "INSERT INTO $mysqlTable (ticket, entrada, validacao, saida, permanencia, tempodesc, created_at) VALUES (:ticket, :entrada, :validacao, :saida, :permanencia, :tempodesc, :created_at)";
        $mysqlStmt = $mysql->prepare($insertQuery);

        foreach ($newRecords as $record) {
            // Mapear as colunas conforme necessário
            $mysqlStmt->execute([
                ':ticket' => $record['ticket'],
                ':entrada' => $record['datahoraentrada'],
                ':validacao' => $record['datahoravalidacao'],
                ':saida' => $record['datahorasaida'],
                ':permanencia' => $record['permanencia'],
                ':tempodesc' => $record['tempodesc'],
                ':created_at' => $data_hora_atual
            ]);
        }

        // Atualizar o último ID processado
        $lastProcessedId = end($newRecords)['id'];
        file_put_contents($lastProcessedFile, $lastProcessedId);
    }

} catch (PDOException $e) {
    error_log("Erro geral: " . $e->getMessage());
    die("Erro ao processar os dados.");
}
