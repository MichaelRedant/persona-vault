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

// Fetch global admin status for further permission checks
$stmtAdmin = $pdo->prepare('SELECT is_admin FROM users WHERE id = ?');
$stmtAdmin->execute([$user_id]);
$is_admin = (bool) $stmtAdmin->fetchColumn();

// Resolve workspace role (owner => admin)
$stmtRole = $pdo->prepare(
    'SELECT w.owner_id, wm.role
     FROM workspaces w
     LEFT JOIN workspace_members wm ON w.id = wm.workspace_id AND wm.user_id = ?
     WHERE w.id = ?
     LIMIT 1'
);
$stmtRole->execute([$user_id, $workspace_id]);
$workspaceAccess = $stmtRole->fetch(PDO::FETCH_ASSOC);

if (!$workspaceAccess) {
    http_response_code(403);
    echo json_encode(['error' => 'No access to this workspace']);
    exit;
}

if ((int)($workspaceAccess['owner_id'] ?? 0) === (int)$user_id) {
    $workspace_role = 'admin';
} else {
    $role = strtolower(trim((string)($workspaceAccess['role'] ?? 'viewer')));
    $workspace_role = in_array($role, ['viewer', 'editor', 'admin'], true) ? $role : 'viewer';
}

$can_manage_workspace = $is_admin || $workspace_role === 'admin';

if (!function_exists('require_workspace_permission')) {
    function require_workspace_permission(string $requiredRole): void
    {
        global $is_admin, $workspace_role;

        if ($is_admin) {
            return;
        }

        $weights = [
            'viewer' => 1,
            'editor' => 2,
            'admin' => 3,
        ];

        $required = strtolower(trim($requiredRole));
        $current = strtolower(trim((string)$workspace_role));

        $requiredWeight = $weights[$required] ?? null;
        $currentWeight = $weights[$current] ?? 0;

        if ($requiredWeight === null) {
            http_response_code(500);
            echo json_encode(['error' => 'Invalid permission configuration']);
            exit;
        }

        if ($currentWeight < $requiredWeight) {
            http_response_code(403);
            echo json_encode(['error' => 'Insufficient workspace permissions']);
            exit;
        }
    }
}
