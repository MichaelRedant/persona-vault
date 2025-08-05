<?php
require 'cors.php';
require 'db.php';
require 'auth_check_admin.php';

header('Content-Type: application/json');

try {
    $stmt = $pdo->query("SELECT w.id, w.name, w.owner_id, w.created_at, u.username AS owner_username FROM workspaces w JOIN users u ON w.owner_id = u.id ORDER BY w.created_at DESC");
    $workspaces = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'workspaces' => $workspaces]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
