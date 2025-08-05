<?php
require 'cors.php';
require 'db.php';
require 'auth_check.php'; // ✅ haalt $user_id & $workspace_id uit JWT
header('Content-Type: application/json');

$personaId = isset($_GET['persona_id']) ? (int) $_GET['persona_id'] : 0;

if ($personaId <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid persona ID']);
    exit;
}

try {
    // ✅ Controleer of de persona van de juiste user + workspace is
    $checkStmt = $pdo->prepare("
        SELECT COUNT(*) FROM personas 
        WHERE id = ? AND user_id = ? AND workspace_id = ?
    ");
    $checkStmt->execute([$personaId, $user_id, $workspace_id]);
    $isOwner = $checkStmt->fetchColumn();

    if (!$isOwner) {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden: not owner of persona or wrong workspace']);
        exit;
    }

    // ✅ Revisions ophalen
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
