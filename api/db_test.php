<?php
$host = '127.0.0.1';
$db   = 'u132120p127267_vault';
$user = 'u132120p127267_MichaelRedant';
$password = 'VaultSecure2024!';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo json_encode(['success' => 'Database connection OK']);
} catch (PDOException $e) {
    http_response_code(500);
    die(json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]));
}
?>
