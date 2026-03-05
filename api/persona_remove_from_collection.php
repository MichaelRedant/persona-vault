<?php
header('Content-Type: application/json');
require 'cors.php';
require 'db.php';
require 'auth_check.php'; // ✅ Haalt $user_id en $workspace_id op via JWT
require_workspace_permission('editor');

$data = json_decode(file_get_contents('php://input'), true);
$persona_id = $data['personaId'] ?? null;
$collection_id = $data['collectionId'] ?? null;

if (!$persona_id || !$collection_id) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing personaId or collectionId']);
    exit;
}

// 🔐 Controleer of persona binnen deze workspace en van deze gebruiker is
if ($can_manage_workspace) {
    $checkStmt = $pdo->prepare("SELECT id FROM personas WHERE id = ? AND workspace_id = ?");
    $checkStmt->execute([$persona_id, $workspace_id]);
} else {
    $checkStmt = $pdo->prepare("SELECT id FROM personas WHERE id = ? AND user_id = ? AND workspace_id = ?");
    $checkStmt->execute([$persona_id, $user_id, $workspace_id]);
}

if ($checkStmt->rowCount() === 0) {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized or persona not in workspace']);
    exit;
}

try {
    $stmt = $pdo->prepare("DELETE FROM persona_collections WHERE persona_id = ? AND collection_id = ?");
    $stmt->execute([$persona_id, $collection_id]);

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to unlink persona from collection: ' . $e->getMessage()]);
}
