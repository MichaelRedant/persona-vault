<?php
declare(strict_types=1);

require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/sanitize_html.php';
require_once __DIR__ . '/workspaces_share_utils.php';

header('Content-Type: application/json');

$token = $_GET['token'] ?? '';
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

    if (workspace_share_is_revoked($pdo, $token)) {
        http_response_code(410);
        echo json_encode(['success' => false, 'message' => 'Share link has been revoked']);
        exit;
    }

    if (workspace_share_is_expired($share)) {
        http_response_code(410);
        echo json_encode(['success' => false, 'message' => 'Share link has expired']);
        exit;
    }

    $workspaceId = (int)$share['workspace_id'];
    $shareScope = workspace_share_scope($share);
    $permissions = workspace_share_permissions($shareScope);
    $expiresAt = workspace_share_expires_at($share)->format(DateTimeInterface::ATOM);

    $workspaceStmt = $pdo->prepare('SELECT id, name FROM workspaces WHERE id = ?');
    $workspaceStmt->execute([$workspaceId]);
    $workspace = $workspaceStmt->fetch(PDO::FETCH_ASSOC);
    if ($workspace) {
        $workspace['id'] = (int)$workspace['id'];
        $workspace['name'] = pv_sanitize_text((string)$workspace['name'], 120);
    }

    $personasStmt = $pdo->prepare('SELECT id, name, description, tags FROM personas WHERE workspace_id = ?');
    $personasStmt->execute([$workspaceId]);
    $personas = array_map(
        static function (array $row): array {
            $tagArray = !empty($row['tags']) ? explode(',', (string)$row['tags']) : [];
            return [
                'id' => (int)$row['id'],
                'name' => pv_sanitize_text((string)$row['name'], 120),
                'description' => pv_sanitize_html((string)$row['description']),
                'tags' => pv_sanitize_tag_list($tagArray),
            ];
        },
        $personasStmt->fetchAll(PDO::FETCH_ASSOC)
    );

    $promptsStmt = $pdo->prepare('SELECT id, title, content, category, tags FROM prompts WHERE workspace_id = ?');
    $promptsStmt->execute([$workspaceId]);
    $prompts = array_map(
        static function (array $row): array {
            $tagArray = !empty($row['tags']) ? explode(',', (string)$row['tags']) : [];
            return [
                'id' => (int)$row['id'],
                'title' => pv_sanitize_text((string)$row['title'], 180),
                'content' => pv_sanitize_html((string)$row['content']),
                'category' => pv_sanitize_text((string)($row['category'] ?? ''), 120),
                'tags' => pv_sanitize_tag_list($tagArray),
            ];
        },
        $promptsStmt->fetchAll(PDO::FETCH_ASSOC)
    );

    echo json_encode([
        'success' => true,
        'workspace' => $workspace,
        'personas' => $personas,
        'prompts' => $prompts,
        'share_scope' => $shareScope,
        'permissions' => $permissions,
        'expires_at' => $expiresAt,
    ]);
} catch (PDOException $e) {
    error_log('workspaces_share_get failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error']);
}
