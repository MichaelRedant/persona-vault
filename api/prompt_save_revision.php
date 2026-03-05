<?php
declare(strict_types=1);

require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth_check.php';
require_once __DIR__ . '/sanitize_html.php';
require_once __DIR__ . '/revisions_utils.php';

require_workspace_permission('editor');
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$id = isset($data['id']) ? (int)$data['id'] : 0;

if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing or invalid prompt ID']);
    exit;
}

try {
    if ($can_manage_workspace) {
        $stmt = $pdo->prepare('SELECT * FROM prompts WHERE id = ? AND workspace_id = ?');
        $stmt->execute([$id, $workspace_id]);
    } else {
        $stmt = $pdo->prepare('SELECT * FROM prompts WHERE id = ? AND user_id = ? AND workspace_id = ?');
        $stmt->execute([$id, $user_id, $workspace_id]);
    }

    $prompt = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$prompt) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Prompt not found or not accessible in this workspace']);
        exit;
    }

    $tags = $prompt['tags'] ? pv_tags_to_csv(pv_sanitize_tag_list(explode(',', (string)$prompt['tags']))) : '';
    $insertSpec = pv_build_compatible_insert($pdo, 'prompt_revisions', [
        'prompt_id' => (int)$prompt['id'],
        'user_id' => $user_id,
        'workspace_id' => $workspace_id,
        'title' => pv_sanitize_text((string)$prompt['title'], 180),
        'content' => pv_sanitize_html((string)$prompt['content']),
        'category' => pv_sanitize_text((string)($prompt['category'] ?? ''), 120),
        'tags' => $tags,
    ]);
    $usedColumns = $insertSpec['used_columns'];
    if (!in_array('prompt_id', $usedColumns, true)) {
        throw new RuntimeException('prompt_revisions schema is missing prompt_id');
    }

    $insert = $pdo->prepare($insertSpec['sql']);
    $insert->execute($insertSpec['params']);

    echo json_encode(['success' => true, 'message' => 'Revision saved']);
} catch (Throwable $e) {
    error_log('prompt_save_revision failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error']);
}
