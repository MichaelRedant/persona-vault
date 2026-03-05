<?php
declare(strict_types=1);

header('Content-Type: application/json');
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth_check.php';
require_once __DIR__ . '/sanitize_html.php';
require_once __DIR__ . '/revisions_utils.php';

$promptId = isset($_GET['prompt_id']) ? (int)$_GET['prompt_id'] : 0;
if ($promptId <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid prompt ID']);
    exit;
}

try {
    $checkStmt = $pdo->prepare(
        'SELECT COUNT(*)
         FROM prompts
         WHERE id = ? AND user_id = ? AND workspace_id = ?'
    );
    $checkStmt->execute([$promptId, $user_id, $workspace_id]);
    $isOwner = (bool)$checkStmt->fetchColumn();

    if (!$isOwner) {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden: not owner or outside workspace']);
        exit;
    }

    $columns = pv_get_table_columns($pdo, 'prompt_revisions');
    if (!in_array('prompt_id', $columns, true)) {
        throw new RuntimeException('prompt_revisions schema is missing prompt_id');
    }

    $selectParts = [
        pv_select_column_or_null($columns, 'id', 'id'),
        'prompt_id AS prompt_id',
        pv_select_column_or_null($columns, 'title', 'title'),
        pv_select_column_or_null($columns, 'content', 'content'),
        pv_select_column_or_null($columns, 'category', 'category'),
        pv_select_column_or_null($columns, 'tags', 'tags'),
        pv_select_column_or_null($columns, 'created_at', 'created_at'),
    ];
    $orderBy = in_array('created_at', $columns, true) ? 'created_at' : 'id';

    $stmt = $pdo->prepare(
        'SELECT ' . implode(', ', $selectParts) . '
         FROM prompt_revisions
         WHERE prompt_id = ?
         ORDER BY ' . $orderBy . ' DESC'
    );
    $stmt->execute([$promptId]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $revisions = array_map(
        static function (array $row): array {
            $tagArray = $row['tags'] ? explode(',', (string)$row['tags']) : [];
            $row['id'] = isset($row['id']) ? (int)$row['id'] : 0;
            $row['prompt_id'] = (int)$row['prompt_id'];
            $row['title'] = pv_sanitize_text((string)$row['title'], 180);
            $row['content'] = pv_sanitize_html((string)$row['content']);
            $row['category'] = pv_sanitize_text((string)$row['category'], 120);
            $row['tags'] = pv_tags_to_csv(pv_sanitize_tag_list($tagArray));
            return $row;
        },
        $rows
    );

    echo json_encode(['success' => true, 'revisions' => $revisions]);
} catch (Throwable $e) {
    error_log('prompt_revisions_get failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
}
