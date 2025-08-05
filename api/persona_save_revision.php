<?php
require 'cors.php';
require 'db.php';
require_once 'auth_check.php'; // ✅ haalt $user_id en $workspace_id veilig op

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

// ✅ Lees JSON input en valideer ID
$data = json_decode(file_get_contents("php://input"), true);
$id = isset($data['id']) ? (int)$data['id'] : 0;

if ($id <= 0) {
  http_response_code(400);
  echo json_encode(['success' => false, 'message' => 'Missing or invalid persona ID']);
  exit;
}

try {
  // ✅ Haal persona op, en check op user én workspace
  $stmt = $pdo->prepare("SELECT * FROM personas WHERE id = ? AND user_id = ? AND workspace_id = ?");
  $stmt->execute([$id, $user_id, $workspace_id]);
  $persona = $stmt->fetch(PDO::FETCH_ASSOC);

  if (!$persona) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Persona not found or not accessible']);
    exit;
  }

  // ✅ Voorzie veilige fallback voor velden
  $name = $persona['name'] ?? '';
  $description = $persona['description'] ?? '';
  $tags = $persona['tags'] ?? '';
  $collection_ids = $persona['collection_ids'] ?? '';

  // ✅ Insert nieuwe revisie mét user_id en workspace_id
  $insert = $pdo->prepare("
    INSERT INTO persona_revisions 
      (persona_id, user_id, workspace_id, name, description, tags, collection_ids, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
  ");
  $insert->execute([
    $persona['id'],
    $user_id,
    $workspace_id,
    $name,
    $description,
    $tags,
    $collection_ids
  ]);

  echo json_encode(['success' => true]);

} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode([
    'success' => false,
    'message' => 'Database error: ' . $e->getMessage()
  ]);
}
