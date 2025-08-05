<?php
require 'cors.php';
require 'db.php';
require 'auth_check.php';

header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);
$workspaceId = isset($input['workspace_id']) ? (int)$input['workspace_id'] : 0;

if (!$workspaceId) {
  http_response_code(400);
  echo json_encode(['success' => false, 'message' => 'Workspace ID is required']);
  exit;
}

try {
  $check = $pdo->prepare('SELECT 1 FROM workspace_members WHERE workspace_id = ? AND user_id = ?');
  $check->execute([$workspaceId, $user_id]);
  if (!$check->fetchColumn()) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'No access to this workspace']);
    exit;
  }

  $token = bin2hex(random_bytes(16));
  $stmt = $pdo->prepare('INSERT INTO workspace_shares (workspace_id, token, created_at) VALUES (?, ?, NOW())');
  $stmt->execute([$workspaceId, $token]);

  echo json_encode(['success' => true, 'token' => $token]);
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
