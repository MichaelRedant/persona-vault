<?php
require 'cors.php';
require 'db.php';
require 'auth_check.php';
require_once 'workspaces_share_utils.php';

header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);
$workspaceId = isset($input['workspace_id']) ? (int)$input['workspace_id'] : 0;
$requestedScope = isset($input['share_scope']) ? strtolower(trim((string)$input['share_scope'])) : 'read';
$allowedScopes = workspace_share_allowed_scopes();

if (!$workspaceId) {
  http_response_code(400);
  echo json_encode(['success' => false, 'message' => 'Workspace ID is required']);
  exit;
}

if (!in_array($requestedScope, $allowedScopes, true)) {
  http_response_code(400);
  echo json_encode([
    'success' => false,
    'message' => 'Invalid share scope',
    'allowed_scopes' => $allowedScopes,
  ]);
  exit;
}

$shareScope = workspace_share_normalize_scope($requestedScope);

try {
  $roleStmt = $pdo->prepare(
    'SELECT w.owner_id, wm.role
     FROM workspaces w
     LEFT JOIN workspace_members wm ON w.id = wm.workspace_id AND wm.user_id = ?
     WHERE w.id = ?
     LIMIT 1'
  );
  $roleStmt->execute([$user_id, $workspaceId]);
  $workspaceAccess = $roleStmt->fetch(PDO::FETCH_ASSOC);

  if (!$workspaceAccess) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'No access to this workspace']);
    exit;
  }

  $isWorkspaceAdmin =
    (int)($workspaceAccess['owner_id'] ?? 0) === (int)$user_id ||
    strtolower((string)($workspaceAccess['role'] ?? '')) === 'admin' ||
    $is_admin;

  if (!$isWorkspaceAdmin) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Admin role required to create share links']);
    exit;
  }

  if ($shareScope !== 'read' && !workspace_share_supports_scope($pdo)) {
    http_response_code(409);
    echo json_encode([
      'success' => false,
      'message' => 'Share scope column missing. Run the share scope migration first.',
    ]);
    exit;
  }

  $token = bin2hex(random_bytes(16));
  $createdAt = new DateTimeImmutable('now', new DateTimeZone('UTC'));
  $expiresAt = $createdAt->modify('+' . workspace_share_ttl_hours() . ' hours');
  workspace_share_insert($pdo, $workspaceId, $token, $expiresAt->format('Y-m-d H:i:s'), $shareScope);

  echo json_encode([
    'success' => true,
    'token' => $token,
    'share_scope' => $shareScope,
    'permissions' => workspace_share_permissions($shareScope),
    'expires_at' => $expiresAt->format(DateTimeInterface::ATOM),
    'ttl_hours' => workspace_share_ttl_hours(),
  ]);
} catch (PDOException $e) {
  error_log('workspaces_share_create failed: ' . $e->getMessage());
  http_response_code(500);
  echo json_encode(['success' => false, 'message' => 'Database error']);
}
