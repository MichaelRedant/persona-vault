<?php
header('Content-Type: application/json');
include 'cors.php';
include 'db.php';
require 'auth_check.php'; // ✅ Haalt $user_id en $workspace_id op
require_workspace_permission('editor');

// ✅ Valideer ID
$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing or invalid prompt ID']);
    exit;
}

try {
    // ✅ Controleer of prompt bestaat en behoort tot gebruiker + workspace (admins mogen alles)
    if ($can_manage_workspace) {
        $checkStmt = $pdo->prepare("SELECT id FROM prompts WHERE id = ? AND workspace_id = ?");
        $checkStmt->execute([$id, $workspace_id]);
    } else {
        $checkStmt = $pdo->prepare("SELECT id FROM prompts WHERE id = ? AND user_id = ? AND workspace_id = ?");
        $checkStmt->execute([$id, $user_id, $workspace_id]);
    }
    $exists = $checkStmt->fetchColumn();

    if (!$exists) {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden: You do not have access to this prompt']);
        exit;
    }

    // ✅ Verwijder prompt
    $deleteStmt = $pdo->prepare("DELETE FROM prompts WHERE id = ?");
    $deleteStmt->execute([$id]);

    echo json_encode(['success' => true]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
