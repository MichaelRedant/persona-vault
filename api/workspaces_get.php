<?php
require 'cors.php';
require 'db.php';
require 'auth_check.php'; // levert $user_id

header('Content-Type: application/json');

try {
    // Haal workspaces op waar user eigenaar of lid is
    $stmt = $pdo->prepare("
        SELECT
            w.id,
            w.name,
            w.owner_id,
            w.created_at,
            CASE
                WHEN w.owner_id = ? THEN 'admin'
                WHEN LOWER(COALESCE(wm.role, 'viewer')) IN ('admin', 'editor', 'viewer') THEN LOWER(wm.role)
                ELSE 'viewer'
            END AS role,
            CASE WHEN w.owner_id = ? THEN 1 ELSE 0 END AS is_owner
        FROM workspaces w
        LEFT JOIN workspace_members wm ON w.id = wm.workspace_id AND wm.user_id = ?
        WHERE w.owner_id = ? OR wm.user_id = ?
        ORDER BY w.created_at DESC
    ");
    $stmt->execute([$user_id, $user_id, $user_id, $user_id, $user_id]);
    $workspaces = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'workspaces' => $workspaces]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
