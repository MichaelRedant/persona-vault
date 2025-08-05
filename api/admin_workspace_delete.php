<?php
require 'cors.php';
require 'db.php';
require 'auth_check_admin.php';

header('Content-Type: application/json');

$workspace_id = $_GET['id'] ?? null;
if (!$workspace_id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Workspace ID is required']);
    exit;
}

try {
    $stmt = $pdo->prepare("DELETE FROM workspaces WHERE id = ?");
    $stmt->execute([$workspace_id]);
    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
