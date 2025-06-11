<?php
error_log('Authorization header: ' . ($_SERVER['HTTP_AUTHORIZATION'] ?? 'NOT SET'));

header('Content-Type: application/json');
include 'cors.php';
include 'db.php';

require_once 'jwt_utils.php';

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

try {
    // Industry fix → collection_id ALTIJD INT of NULL
   $stmt = $pdo->prepare("
    SELECT 
        id, name, description, favorite, tags,
        collection_id,
        created_at, updated_at
    FROM personas
    WHERE user_id = ?
    ORDER BY created_at DESC
");
    $stmt->execute([$user_id]);
    $personas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Geen foreach meer nodig → collection_id komt 100% juist binnen
    echo json_encode(is_array($personas) ? $personas : []);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch personas: ' . $e->getMessage()]);
}
