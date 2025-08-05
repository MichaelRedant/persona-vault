<?php
header('Content-Type: application/json');
include 'cors.php';
include 'db.php';
require_once 'auth_check.php'; // ⬅️ haalt $user_id en $workspace_id uit JWT

try {
    $stmt = $pdo->prepare("SELECT * FROM prompts WHERE user_id = ? AND workspace_id = ? ORDER BY created_at DESC");
    $stmt->execute([$user_id, $workspace_id]);
    $prompts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(is_array($prompts) ? $prompts : []);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch prompts: ' . $e->getMessage()]);
}
