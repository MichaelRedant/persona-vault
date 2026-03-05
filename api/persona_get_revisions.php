<?php
declare(strict_types=1);

header('Content-Type: application/json');
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth_check.php';
require_once __DIR__ . '/sanitize_html.php';
require_once __DIR__ . '/revisions_utils.php';

$personaId = isset($_GET['persona_id']) ? (int)$_GET['persona_id'] : 0;
if ($personaId <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid persona ID']);
    exit;
}

try {
    $checkStmt = $pdo->prepare(
        'SELECT COUNT(*)
         FROM personas
         WHERE id = ? AND user_id = ? AND workspace_id = ?'
    );
    $checkStmt->execute([$personaId, $user_id, $workspace_id]);
    $isOwner = (bool)$checkStmt->fetchColumn();

    if (!$isOwner) {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden: not owner of persona or wrong workspace']);
        exit;
    }

    $columns = pv_get_table_columns($pdo, 'persona_revisions');
    if (!in_array('persona_id', $columns, true)) {
        throw new RuntimeException('persona_revisions schema is missing persona_id');
    }

    $selectParts = [
        pv_select_column_or_null($columns, 'id', 'id'),
        'persona_id AS persona_id',
        pv_select_column_or_null($columns, 'name', 'name'),
        pv_select_column_or_null($columns, 'description', 'description'),
        pv_select_column_or_null($columns, 'tags', 'tags'),
        pv_select_column_or_null($columns, 'collection_ids', 'collection_ids'),
        pv_select_column_or_null($columns, 'created_at', 'created_at'),
    ];
    $orderBy = in_array('created_at', $columns, true) ? 'created_at' : 'id';

    $stmt = $pdo->prepare(
        'SELECT ' . implode(', ', $selectParts) . '
         FROM persona_revisions
         WHERE persona_id = ?
         ORDER BY ' . $orderBy . ' DESC'
    );
    $stmt->execute([$personaId]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $revisions = array_map(
        static function (array $row): array {
            $tagArray = $row['tags'] ? explode(',', (string)$row['tags']) : [];
            $row['id'] = isset($row['id']) ? (int)$row['id'] : 0;
            $row['persona_id'] = (int)$row['persona_id'];
            $row['name'] = pv_sanitize_text((string)$row['name'], 120);
            $row['description'] = pv_sanitize_html((string)$row['description']);
            $row['tags'] = pv_tags_to_csv(pv_sanitize_tag_list($tagArray));
            $row['collection_ids'] = pv_sanitize_text((string)$row['collection_ids'], 1000);
            return $row;
        },
        $rows
    );

    echo json_encode(['success' => true, 'revisions' => $revisions]);
} catch (Throwable $e) {
    error_log('persona_get_revisions failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
}
