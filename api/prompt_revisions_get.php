<?php
require 'cors.php';
require 'db.php';
require_once 'auth_check.php'; // ✅ haalt $user_id en $workspace_id uit JWT

header('Content-Type: application/json');

$promptId = isset($_GET['prompt_id']) ? (int) $_GET['prompt_id'] : 0;

if ($promptId <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid prompt ID']);
    exit;
}

try {
    // ✅ Check of prompt eigendom is van gebruiker én binnen juiste workspace valt
    $checkStmt = $pdo->prepare("
        SELECT COUNT(*) 
        FROM prompts 
        WHERE id = ? AND user_id = ? AND workspace_id = ?
    ");
    $checkStmt->execute([$promptId, $user_id, $workspace_id]);
    $isOwner = $checkStmt->fetchColumn();

    if (!$isOwner) {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden: not owner or outside workspace']);
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
