<?php
header('Content-Type: application/json');
include 'cors.php';
require 'auth_check.php'; // ✅ haalt $user_id en $workspace_id uit JWT
include 'db.php';
require_workspace_permission('editor');

// ✅ Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ✅ JSON uitlezen
$data = json_decode(file_get_contents('php://input'), true);

$id = $data['id'] ?? 0;
$favorite = isset($data['favorite']) ? (int)$data['favorite'] : 0;

if (!$id || !in_array($favorite, [0, 1])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid input']);
    exit;
}

// ✅ Controleer eigendom + workspace-scope
if ($can_manage_workspace) {
    $stmt = $pdo->prepare("SELECT id FROM prompts WHERE id = ? AND workspace_id = ?");
    $stmt->execute([$id, $workspace_id]);
} else {
    $stmt = $pdo->prepare("SELECT id FROM prompts WHERE id = ? AND user_id = ? AND workspace_id = ?");
    $stmt->execute([$id, $user_id, $workspace_id]);
}
if (!$stmt->fetchColumn()) {
    http_response_code(403);
    echo json_encode(['error' => 'Not authorized to modify this prompt']);
    exit;
}

// ✅ Update favorite-status
$updateStmt = $pdo->prepare("UPDATE prompts SET favorite = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
$updateStmt->execute([$favorite, $id]);

echo json_encode(['success' => true]);
