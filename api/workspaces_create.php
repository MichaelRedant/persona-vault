<?php
require 'cors.php';
require 'db.php';
require 'auth_check.php'; // levert $user_id

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);
$name = trim($data['name'] ?? '');

if (!$name) {
  http_response_code(400);
  echo json_encode(['success' => false, 'message' => 'Workspace name is required']);
  exit;
}

try {
  // Workspace aanmaken
  $stmt = $pdo->prepare("INSERT INTO workspaces (name, owner_id) VALUES (?, ?)");
  $stmt->execute([$name, $user_id]);
  $workspace_id = $pdo->lastInsertId();

  // Owner automatisch toevoegen aan members-tabel
  $stmt = $pdo->prepare("INSERT INTO workspace_members (workspace_id, user_id, role) VALUES (?, ?, 'admin')");
  $stmt->execute([$workspace_id, $user_id]);

  echo json_encode(['success' => true, 'workspace_id' => $workspace_id]);
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
