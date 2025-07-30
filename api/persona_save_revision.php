<?php
require 'auth_check.php';
require 'db.php';

$data = json_decode(file_get_contents("php://input"), true);
$id = $data['id'];

$stmt = $pdo->prepare("SELECT * FROM personas WHERE id = ?");
$stmt->execute([$id]);
$persona = $stmt->fetch(PDO::FETCH_ASSOC);

if ($persona) {
  $insert = $pdo->prepare("INSERT INTO persona_revisions (persona_id, name, description, tags, collection_ids) VALUES (?, ?, ?, ?, ?)");
  $insert->execute([
    $persona['id'],
    $persona['name'],
    $persona['description'],
    $persona['tags'],
    $persona['collection_ids']
  ]);
  echo json_encode(['success' => true]);
} else {
  http_response_code(404);
  echo json_encode(['success' => false, 'message' => 'Persona not found']);
}
