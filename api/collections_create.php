<?php
header('Content-Type: application/json');
include 'cors.php';
require 'auth_check.php'; // ✅ Haalt $user_id en $workspace_id op
include 'db.php';
require_workspace_permission('editor');

// ✅ Input ophalen
$data = json_decode(file_get_contents('php://input'), true);
$name = trim($data['name'] ?? '');

// ✅ Validatie
if (empty($name)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing collection name']);
    exit;
}

try {
    // ✅ Insert met workspace scoping
    $stmt = $pdo->prepare("
        INSERT INTO collections (user_id, workspace_id, name) 
        VALUES (?, ?, ?)
    ");
    $stmt->execute([$user_id, $workspace_id, $name]);

    echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
