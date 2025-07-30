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
$promptId = isset($_GET['prompt_id']) ? (int) $_GET['prompt_id'] : 0;

if ($promptId <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid prompt ID']);
    exit;
}

try {
    // ✅ Check of prompt eigendom is van gebruiker
    $checkStmt = $pdo->prepare("SELECT COUNT(*) FROM prompts WHERE id = ? AND user_id = ?");
    $checkStmt->execute([$promptId, $user_id]);
    $isOwner = $checkStmt->fetchColumn();

    if (!$isOwner) {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden: not owner of prompt']);
        exit;
    }

    // ✅ Revisions ophalen
    $stmt = $pdo->prepare("
        SELECT id, prompt_id, title, content, category, tags, created_at 
        FROM prompt_revisions 
        WHERE prompt_id = ? 
        ORDER BY created_at DESC
    ");
    $stmt->execute([$promptId]);
    $revisions = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'revisions' => $revisions
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
