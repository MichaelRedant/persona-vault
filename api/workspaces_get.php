<?php
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require 'cors.php';
require 'db.php';
require 'auth_check.php'; // levert $user_id

header('Content-Type: application/json');

try {
    // Haal workspaces op waar user eigenaar of lid is
    $stmt = $pdo->prepare("
        SELECT w.id, w.name, w.owner_id, w.created_at
        FROM workspaces w
        LEFT JOIN workspace_members wm ON w.id = wm.workspace_id
        WHERE w.owner_id = ? OR wm.user_id = ?
        GROUP BY w.id
        ORDER BY w.created_at DESC
    ");
    $stmt->execute([$user_id, $user_id]);
    $workspaces = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'workspaces' => $workspaces]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
