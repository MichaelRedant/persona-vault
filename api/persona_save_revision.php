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
    echo json_encode(['success' => false, 'message' => 'Missing or invalid persona ID']);
    exit;
}

try {
    if ($can_manage_workspace) {
        $stmt = $pdo->prepare('SELECT * FROM personas WHERE id = ? AND workspace_id = ?');
        $stmt->execute([$id, $workspace_id]);
    } else {
        $stmt = $pdo->prepare('SELECT * FROM personas WHERE id = ? AND user_id = ? AND workspace_id = ?');
        $stmt->execute([$id, $user_id, $workspace_id]);
    }

    $persona = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$persona) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Persona not found or not accessible']);
        exit;
    }

    $tags = $persona['tags'] ? pv_tags_to_csv(pv_sanitize_tag_list(explode(',', (string)$persona['tags']))) : '';
    $sourceDescription = (string)($persona['description'] ?? '');
    if (trim(strip_tags($sourceDescription)) === '' && isset($persona['content'])) {
        $sourceDescription = (string)$persona['content'];
    }

    $insertSpec = pv_build_compatible_insert($pdo, 'persona_revisions', [
        'persona_id' => (int)$persona['id'],
        'user_id' => $user_id,
        'workspace_id' => $workspace_id,
        'name' => pv_sanitize_text((string)($persona['name'] ?? ''), 120),
        'description' => pv_sanitize_html($sourceDescription),
        'tags' => $tags,
        'collection_ids' => pv_sanitize_text((string)($persona['collection_ids'] ?? ''), 1000),
    ]);
    $usedColumns = $insertSpec['used_columns'];
    if (!in_array('persona_id', $usedColumns, true)) {
        throw new RuntimeException('persona_revisions schema is missing persona_id');
    }

    $insert = $pdo->prepare($insertSpec['sql']);
    $insert->execute($insertSpec['params']);

    echo json_encode(['success' => true]);
} catch (Throwable $e) {
    error_log('persona_save_revision failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error']);
}
