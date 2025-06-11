<?php
header('Content-Type: application/json');
include 'cors.php';
include 'db.php';
include 'jwt_utils.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    http_response_code(401);
    echo json_encode(['error' => 'Missing or invalid Authorization header']);
    exit;
}

$jwt = $matches[1];
$decoded = validate_jwt($jwt);

if (!$decoded) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid or expired token']);
    exit;
}

$user_id = $decoded['user_id'] ?? null;
if (!$user_id) {
    http_response_code(401);
    echo json_encode(['error' => 'Token missing user_id']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

$name = $data['name'] ?? '';
$description = $data['description'] ?? '';
$tags = isset($data['tags']) && is_array($data['tags'])
    ? implode(',', array_map('trim', $data['tags']))
    : '';

// ✅ CollectionId → optioneel
$collection_id = isset($data['collectionId']) && is_numeric($data['collectionId']) ? (int)$data['collectionId'] : null;

// Prepare INSERT statement → met collection_id
$stmt = $pdo->prepare("INSERT INTO personas (user_id, name, description, tags, collection_id) VALUES (?, ?, ?, ?, ?)");
$stmt->execute([$user_id, $name, $description, $tags, $collection_id]);

echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
