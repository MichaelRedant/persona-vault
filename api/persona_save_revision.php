<?php
require 'cors.php'; // Indien je CORS gebruikt
require 'db.php';
require_once 'jwt_utils.php';

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

// ✅ Lees en valideer JSON input
$data = json_decode(file_get_contents("php://input"), true);
$id = isset($data['id']) ? (int)$data['id'] : 0;

if ($id <= 0) {
  http_response_code(400);
  echo json_encode(['success' => false, 'message' => 'Missing or invalid persona ID']);
  exit;
}

// ✅ Controleer JWT-token
$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
  http_response_code(401);
  echo json_encode(['success' => false, 'message' => 'Missing or invalid Authorization header']);
  exit;
}

$jwt = $matches[1];
$decoded = validate_jwt($jwt);

if (!$decoded || !isset($decoded['user_id'])) {
  http_response_code(401);
  echo json_encode(['success' => false, 'message' => 'Invalid or expired token']);
  exit;
}

$user_id = $decoded['user_id'];

try {
  // ✅ Haal persona op en controleer eigendom
  $stmt = $pdo->prepare("SELECT * FROM personas WHERE id = ? AND user_id = ?");
  $stmt->execute([$id, $user_id]);
  $persona = $stmt->fetch(PDO::FETCH_ASSOC);

  if (!$persona) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Persona not found or not owned']);
    exit;
  }

  // ✅ Fallbacks voor nullable velden
  $name = $persona['name'] ?? '';
  $description = $persona['description'] ?? '';
  $tags = $persona['tags'] ?? '';
  $collection_ids = $persona['collection_ids'] ?? '';

  // ✅ Insert revisie
  $insert = $pdo->prepare("
    INSERT INTO persona_revisions 
      (persona_id, name, description, tags, collection_ids, created_at)
    VALUES (?, ?, ?, ?, ?, NOW())
  ");
  $insert->execute([
    $persona['id'],
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
