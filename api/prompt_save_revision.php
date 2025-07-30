<?php
require 'auth_check.php';
require 'db.php';

header('Content-Type: application/json');

// ✅ JSON-body uitlezen en checken
$data = json_decode(file_get_contents("php://input"), true);
$id = isset($data['id']) ? (int)$data['id'] : 0;

if ($id <= 0) {
  http_response_code(400);
  echo json_encode(['success' => false, 'message' => 'Missing or invalid prompt ID']);
  exit;
}

// ✅ Prompt ophalen
try {
  $stmt = $pdo->prepare("SELECT * FROM prompts WHERE id = ?");
  $stmt->execute([$id]);
  $prompt = $stmt->fetch(PDO::FETCH_ASSOC);

  if (!$prompt) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Prompt not found']);
    exit;
  }

  // ✅ Revisie aanmaken
  $insert = $pdo->prepare("
    INSERT INTO prompt_revisions (prompt_id, title, content, category, tags, created_at)
    VALUES (?, ?, ?, ?, ?, NOW())
  ");
  $insert->execute([
    $prompt['id'],
    $prompt['title'],
    $prompt['content'],
    $prompt['category'] ?? '',
    $prompt['tags'] ?? ''
  ]);

  echo json_encode(['success' => true, 'message' => 'Revision saved']);
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode([
    'success' => false,
    'message' => 'Database error: ' . $e->getMessage()
  ]);
}
