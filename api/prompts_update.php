<?php
declare(strict_types=1);

header('Content-Type: application/json');
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth_check.php';
require_once __DIR__ . '/sanitize_html.php';

require_workspace_permission('editor');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON input']);
    exit;
}

$id = (int)($data['id'] ?? 0);
$title = pv_sanitize_text((string)($data['title'] ?? ''), 180);
$content = pv_sanitize_html((string)($data['content'] ?? ''));
$category = pv_sanitize_text((string)($data['category'] ?? ''), 120);
$favorite = isset($data['favorite']) ? (int)$data['favorite'] : 0;
$tags = pv_tags_to_csv(pv_sanitize_tag_list($data['tags'] ?? []));

if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid prompt id']);
    exit;
}

if ($title === '' || $content === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Title and content are required']);
    exit;
}

try {
    if ($can_manage_workspace) {
        $checkStmt = $pdo->prepare('SELECT 1 FROM prompts WHERE id = ? AND workspace_id = ?');
        $checkStmt->execute([$id, $workspace_id]);
    } else {
        $checkStmt = $pdo->prepare('SELECT 1 FROM prompts WHERE id = ? AND user_id = ? AND workspace_id = ?');
        $checkStmt->execute([$id, $user_id, $workspace_id]);
    }

    if (!$checkStmt->fetchColumn()) {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden: You do not have access to this prompt']);
        exit;
    }

    if ($can_manage_workspace) {
        $stmt = $pdo->prepare(
            'UPDATE prompts
             SET title = ?, content = ?, category = ?, favorite = ?, tags = ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ? AND workspace_id = ?'
        );
        $stmt->execute([$title, $content, $category, $favorite, $tags, $id, $workspace_id]);
    } else {
        $stmt = $pdo->prepare(
            'UPDATE prompts
             SET title = ?, content = ?, category = ?, favorite = ?, tags = ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ? AND user_id = ? AND workspace_id = ?'
        );
        $stmt->execute([$title, $content, $category, $favorite, $tags, $id, $user_id, $workspace_id]);
    }

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    error_log('prompts_update failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
}
