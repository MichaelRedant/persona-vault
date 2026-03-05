<?php
declare(strict_types=1);

require __DIR__ . '/cors.php';
require __DIR__ . '/db.php';
require __DIR__ . '/auth_check.php';
require_once __DIR__ . '/workspaces_share_utils.php';

header('Content-Type: application/json');
require_workspace_permission('admin');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$token = trim((string)($input['token'] ?? ''));
$workspaceId = isset($input['workspace_id']) ? (int)$input['workspace_id'] : $workspace_id;

if ($token === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Token is required']);
    exit;
}

if (!preg_match('/^[a-f0-9]{32,128}$/', $token)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid token format']);
    exit;
}

try {
    $share = workspace_share_get_by_token($pdo, $token);
    if (!$share) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Share link not found']);
        exit;
    }

    if ((int)$share['workspace_id'] !== $workspaceId) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Token does not belong to this workspace']);
        exit;
    }

    workspace_share_ensure_revocation_table($pdo);
    $stmt = $pdo->prepare(
        'INSERT INTO workspace_share_revocations (token, workspace_id, revoked_by_user_id, revoked_at)
         VALUES (?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE revoked_at = VALUES(revoked_at), revoked_by_user_id = VALUES(revoked_by_user_id)'
    );
    $stmt->execute([$token, $workspaceId, $user_id]);

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    error_log('workspaces_share_revoke failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error']);
}

