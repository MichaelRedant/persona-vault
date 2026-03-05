<?php
header('Content-Type: application/json');
require 'cors.php';
require 'auth_check.php'; // ✅ haalt $user_id en $workspace_id op
require 'db.php';
require_workspace_permission('editor');

$id = isset($_GET['id']) ? (int) $_GET['id'] : 0;

if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing or invalid persona ID']);
    exit;
}

try {
    // ✅ Controleer of persona bestaat en of user eigenaar is (admins mogen alles)
    if ($can_manage_workspace) {
        $check = $pdo->prepare("SELECT id FROM personas WHERE id = ? AND workspace_id = ?");
        $check->execute([$id, $workspace_id]);
    } else {
        $check = $pdo->prepare("SELECT id FROM personas WHERE id = ? AND user_id = ? AND workspace_id = ?");
        $check->execute([$id, $user_id, $workspace_id]);
    }

    if (!$check->fetchColumn()) {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden: You do not have access to this persona']);
        exit;
    }

    $stmt = $pdo->prepare("DELETE FROM personas WHERE id = ?");
    $stmt->execute([$id]);

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
