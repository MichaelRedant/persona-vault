<?php
require_once 'jwt_utils.php';
require_once 'db.php';

header('Content-Type: application/json');

$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';

if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    http_response_code(401);
    echo json_encode(['error' => 'Missing or invalid Authorization header']);
    exit;
}

$jwt = $matches[1];
$decoded = validate_jwt($jwt);

if (!$decoded || !isset($decoded['user_id']) || !isset($decoded['workspace_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid or expired token']);
    exit;
}

$user_id = $decoded['user_id'];
$workspace_id = (int)$decoded['workspace_id'];

if (isset($_GET['workspace_id'])) {
    $requestedWorkspaceId = (int)$_GET['workspace_id'];
    if ($requestedWorkspaceId !== $workspace_id) {
        $stmt = $pdo->prepare('SELECT 1 FROM workspaces w LEFT JOIN workspace_members wm ON w.id = wm.workspace_id WHERE w.id = ? AND (w.owner_id = ? OR wm.user_id = ?)');
        $stmt->execute([$requestedWorkspaceId, $user_id, $user_id]);
        if ($stmt->fetchColumn()) {
            $workspace_id = $requestedWorkspaceId;
        } else {
            http_response_code(403);
            echo json_encode(['error' => 'No access to this workspace']);
            exit;
        }
    }
}

// Fetch admin status for further permission checks
$stmt = $pdo->prepare('SELECT is_admin FROM users WHERE id = ?');
$stmt->execute([$user_id]);
$is_admin = (bool) $stmt->fetchColumn();
