<?php
header('Content-Type: application/json');
include 'cors.php';
include 'db.php';
include 'jwt_utils.php';

// ✅ JWT Auth
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
    echo json_encode(['error' => 'Invalid or expired token']);
    exit;
}

$user_id = $decoded['user_id'];

// ✅ POST data uitlezen
$data = json_decode(file_get_contents('php://input'), true);
$persona_id = $data['personaId'] ?? null;
$collection_id = $data['collectionId'] ?? null;

if (!$persona_id || !$collection_id) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing personaId or collectionId']);
    exit;
}

// 🔒 Check of persona eigendom is van gebruiker
$checkStmt = $pdo->prepare("SELECT id FROM personas WHERE id = ? AND user_id = ?");
$checkStmt->execute([$persona_id, $user_id]);

if ($checkStmt->rowCount() === 0) {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

// ✅ Delete link in pivot table
$stmt = $pdo->prepare("DELETE FROM persona_collections WHERE persona_id = ? AND collection_id = ?");
$stmt->execute([$persona_id, $collection_id]);

echo json_encode(['success' => true]);
