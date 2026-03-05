<?php
header('Content-Type: application/json');
include 'cors.php';
require 'auth_check.php'; // ✅ valideert JWT en zet $user_id, $workspace_id
include 'db.php';
require_workspace_permission('editor');

// ✅ OPTIONS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ✅ Input lezen
$data = json_decode(file_get_contents('php://input'), true);
$id = $data['id'] ?? 0;
$favorite = isset($data['favorite']) ? (int)$data['favorite'] : 0;

if (!$id) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing persona ID']);
    exit;
}

if ($can_manage_workspace) {
    $stmt = $pdo->prepare("
      UPDATE personas
      SET favorite = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND workspace_id = ?
    ");
    $stmt->execute([$favorite, $id, $workspace_id]);
} else {
    $stmt = $pdo->prepare("
      UPDATE personas
      SET favorite = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ? AND workspace_id = ?
    ");
    $stmt->execute([$favorite, $id, $user_id, $workspace_id]);
}

echo json_encode(['success' => true]);
