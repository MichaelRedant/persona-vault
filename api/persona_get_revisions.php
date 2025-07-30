<?php
require 'cors.php';
require 'db.php';
require_once 'jwt_utils.php';

header('Content-Type: application/json');

// ✅ Auth check
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
$personaId = isset($_GET['persona_id']) ? (int) $_GET['persona_id'] : 0;

if ($personaId <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid persona ID']);
    exit;
}

try {
    // ✅ Check eerst of de gebruiker eigenaar is van deze persona
    $checkStmt = $pdo->prepare("SELECT COUNT(*) FROM personas WHERE id = ? AND user_id = ?");
    $checkStmt->execute([$personaId, $user_id]);
    $isOwner = $checkStmt->fetchColumn();

    if (!$isOwner) {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden: not owner of persona']);
        exit;
    }

    // ✅ Haal revisies op
    $stmt = $pdo->prepare("
        SELECT id, persona_id, name, description, tags, collection_ids, created_at 
        FROM persona_revisions 
        WHERE persona_id = ? 
        ORDER BY created_at DESC
    ");
    $stmt->execute([$personaId]);
    $revisions = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'revisions' => $revisions]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
