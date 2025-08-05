<?php
require 'cors.php';
require 'db.php';

header('Content-Type: application/json');

$token = $_GET['token'] ?? '';
if (!$token) {
  http_response_code(400);
  echo json_encode(['success' => false, 'message' => 'Token is required']);
  exit;
}

try {
  $stmt = $pdo->prepare('SELECT workspace_id FROM workspace_shares WHERE token = ?');
  $stmt->execute([$token]);
  $share = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$share) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Share link not found']);
    exit;
  }
  $workspaceId = $share['workspace_id'];

  $wsStmt = $pdo->prepare('SELECT id, name FROM workspaces WHERE id = ?');
  $wsStmt->execute([$workspaceId]);
  $workspace = $wsStmt->fetch(PDO::FETCH_ASSOC);

  $personasStmt = $pdo->prepare('SELECT id, name, description FROM personas WHERE workspace_id = ?');
  $personasStmt->execute([$workspaceId]);
  $personas = $personasStmt->fetchAll(PDO::FETCH_ASSOC);

  $promptsStmt = $pdo->prepare('SELECT id, title, content FROM prompts WHERE workspace_id = ?');
  $promptsStmt->execute([$workspaceId]);
  $prompts = $promptsStmt->fetchAll(PDO::FETCH_ASSOC);

  echo json_encode([
    'success' => true,
    'workspace' => $workspace,
    'personas' => $personas,
    'prompts' => $prompts
  ]);
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
