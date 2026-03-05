<?php
declare(strict_types=1);

require_once __DIR__ . '/env.php';

$host = pv_env('DB_HOST', '127.0.0.1');
$port = pv_env('DB_PORT', '3306');
$db = pv_env('DB_NAME');
$user = pv_env('DB_USER');
$password = pv_env('DB_PASSWORD');

if ($db === null || $db === '' || $user === null || $user === '' || $password === null) {
    error_log('Missing required DB environment variables (DB_NAME/DB_USER/DB_PASSWORD)');
    if (!headers_sent()) {
        header('Content-Type: application/json');
        http_response_code(500);
    }
    echo json_encode(['error' => 'Server configuration error']);
    exit;
}

try {
    $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4', $host, $port, $db);
    $pdo = new PDO($dsn, $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    error_log('Database connection failed: ' . $e->getMessage());
    if (!headers_sent()) {
        header('Content-Type: application/json');
        http_response_code(500);
    }
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}
