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

try {
    $stmt = $pdo->prepare("
        SELECT pc.persona_id, pc.collection_id
        FROM persona_collections pc
        JOIN personas p ON p.id = pc.persona_id
        WHERE p.user_id = ?
    ");
    $stmt->execute([$user_id]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($rows);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch persona-collection links: ' . $e->getMessage()]);
}
