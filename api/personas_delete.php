<?php
header('Content-Type: application/json');
require 'cors.php';
require 'auth_check.php'; // ✅ haalt $user_id en $workspace_id op
require 'db.php';

$id = isset($_GET['id']) ? (int) $_GET['id'] : 0;

if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing or invalid persona ID']);
    exit;
}

try {
    // ✅ Delete alleen als persona bij gebruiker EN workspace hoort
    $stmt = $pdo->prepare("DELETE FROM personas WHERE id = ? AND user_id = ? AND workspace_id = ?");
    $stmt->execute([$id, $user_id, $workspace_id]);

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
