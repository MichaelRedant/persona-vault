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

// Haal alle collections voor deze user
$stmt = $pdo->prepare("SELECT id, name, created_at, updated_at FROM collections WHERE user_id = ? ORDER BY created_at DESC");
$stmt->execute([$user_id]);
$collections = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Industry clean → created_at / updated_at → altijd string (empty if null)
foreach ($collections as &$collection) {
    $collection['created_at'] = isset($collection['created_at']) && $collection['created_at'] !== null
        ? $collection['created_at']
        : '';
    $collection['updated_at'] = isset($collection['updated_at']) && $collection['updated_at'] !== null
        ? $collection['updated_at']
        : '';
}

echo json_encode($collections);
