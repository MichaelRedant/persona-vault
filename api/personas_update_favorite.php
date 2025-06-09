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

$data = json_decode(file_get_contents('php://input'), true);

$id = $data['id'] ?? 0;
$favorite = isset($data['favorite']) ? (int)$data['favorite'] : 0;

$stmt = $pdo->prepare("UPDATE personas SET favorite = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?");
$stmt->execute([$favorite, $id, $user_id]);

echo json_encode(['success' => true]);
