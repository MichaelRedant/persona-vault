<?php
header('Content-Type: application/json');
include 'cors.php';
include 'db.php';
include 'jwt_utils.php';

$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    http_response_code(401);
    echo json_encode(['error' => 'Missing or invalid Authorization header']);
    exit;
}

$jwt = $matches[1];
$decoded = validate_jwt($jwt);

if (!$decoded || !isset($decoded['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid token']);
    exit;
}

$user_id = $decoded['user_id'];

$data = json_decode(file_get_contents('php://input'), true);
$persona_id = $data['persona_id'] ?? null;
$collection_ids = $data['collection_ids'] ?? [];

if (!$persona_id || !is_array($collection_ids)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing persona_id or collection_ids']);
    exit;
}

try {
    $pdo->beginTransaction();

    // Check ownership
    $check = $pdo->prepare("SELECT id FROM personas WHERE id = ? AND user_id = ?");
    $check->execute([$persona_id, $user_id]);
    if ($check->rowCount() === 0) {
        http_response_code(403);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }

    // Delete previous
    $del = $pdo->prepare("DELETE FROM persona_collections WHERE persona_id = ?");
    $del->execute([$persona_id]);

    // Insert new
    $insert = $pdo->prepare("INSERT INTO persona_collections (persona_id, collection_id) VALUES (?, ?)");
    foreach ($collection_ids as $col_id) {
        $insert->execute([$persona_id, $col_id]);
    }

    $pdo->commit();
    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'Update failed: ' . $e->getMessage()]);
}
