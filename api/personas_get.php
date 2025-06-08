<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');

include 'db.php';

try {
    $stmt = $pdo->query("SELECT * FROM personas ORDER BY created_at DESC");
    $personas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(is_array($personas) ? $personas : []);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch personas: ' . $e->getMessage()]);
}
