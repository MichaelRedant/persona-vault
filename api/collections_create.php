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

if (!$decoded) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid or expired token']);
    exit;
}

$user_id = $decoded['user_id'] ?? null;

$data = json_decode(file_get_contents('php://input'), true);

$name = trim($data['name'] ?? '');

if (empty($name)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing collection name']);
    exit;
}

$stmt = $pdo->prepare("INSERT INTO collections (user_id, name) VALUES (?, ?)");
$stmt->execute([$user_id, $name]);

echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
