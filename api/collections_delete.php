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

$id = $_GET['id'] ?? 0;

if (!$id || !is_numeric($id)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid collection id']);
    exit;
}

// BELANGRIJK: enkel collections van ingelogde user mogen verwijderd worden
$stmt = $pdo->prepare("DELETE FROM collections WHERE id = ? AND user_id = ?");
$stmt->execute([$id, $user_id]);

echo json_encode(['success' => true]);
