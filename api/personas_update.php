<?php
declare(strict_types=1);

header('Content-Type: application/json');
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth_check.php';
require_once __DIR__ . '/sanitize_html.php';
require_once __DIR__ . '/revisions_utils.php';

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
$name = pv_sanitize_text((string)($data['name'] ?? ''), 120);
$rawDescription = (string)($data['description'] ?? '');
$description = pv_sanitize_html($rawDescription);
$plainDescription = trim(html_entity_decode(strip_tags($description), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'));

if ($description === '' && trim(pv_sanitize_text($rawDescription, 20000)) !== '') {
    $escaped = htmlspecialchars(pv_normalize_utf8($rawDescription), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $description = '<p>' . nl2br($escaped, false) . '</p>';
    $plainDescription = trim(html_entity_decode(strip_tags($description), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'));
}

$favorite = isset($data['favorite']) ? (int)$data['favorite'] : 0;
$tags = pv_tags_to_csv(pv_sanitize_tag_list($data['tags'] ?? []));
$collectionIds = isset($data['collectionIds']) && is_array($data['collectionIds'])
    ? array_filter(array_map('intval', $data['collectionIds']), static fn(int $value): bool => $value > 0)
    : [];

if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid persona id']);
    exit;
}

if ($name === '' || $plainDescription === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Name and description are required']);
    exit;
}

try {
    $personaColumns = pv_get_table_columns($pdo, 'personas');
    $hasDescriptionColumn = in_array('description', $personaColumns, true);
    $hasContentColumn = in_array('content', $personaColumns, true);

    if (!$hasDescriptionColumn && !$hasContentColumn) {
        throw new RuntimeException('personas schema has no description/content column');
    }

    if ($can_manage_workspace) {
        $ownerStmt = $pdo->prepare('SELECT user_id FROM personas WHERE id = ? AND workspace_id = ?');
        $ownerStmt->execute([$id, $workspace_id]);
    } else {
        $ownerStmt = $pdo->prepare('SELECT user_id FROM personas WHERE id = ? AND user_id = ? AND workspace_id = ?');
        $ownerStmt->execute([$id, $user_id, $workspace_id]);
    }

    $ownerId = $ownerStmt->fetchColumn();
    if (!$ownerId) {
        http_response_code(403);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }

    $pdo->beginTransaction();

    $setParts = ['name = ?', 'favorite = ?', 'tags = ?', 'updated_at = CURRENT_TIMESTAMP'];
    $updateParams = [$name, $favorite, $tags];
    if ($hasDescriptionColumn) {
        $setParts[] = 'description = ?';
        $updateParams[] = $description;
    }
    if ($hasContentColumn) {
        $setParts[] = 'content = ?';
        $updateParams[] = $description;
    }
    $setSql = implode(', ', $setParts);

    if ($can_manage_workspace) {
        $updateStmt = $pdo->prepare(
            'UPDATE personas
             SET ' . $setSql . '
             WHERE id = ? AND workspace_id = ?'
        );
        $updateStmt->execute(array_merge($updateParams, [$id, $workspace_id]));
    } else {
        $updateStmt = $pdo->prepare(
            'UPDATE personas
             SET ' . $setSql . '
             WHERE id = ? AND user_id = ? AND workspace_id = ?'
        );
        $updateStmt->execute(array_merge($updateParams, [$id, $user_id, $workspace_id]));
    }

    $deleteStmt = $pdo->prepare('DELETE FROM persona_collections WHERE persona_id = ?');
    $deleteStmt->execute([$id]);

    if (!empty($collectionIds)) {
        $insertStmt = $pdo->prepare(
            'INSERT INTO persona_collections (persona_id, collection_id, user_id) VALUES (?, ?, ?)'
        );
        foreach ($collectionIds as $collectionId) {
            $insertStmt->execute([$id, $collectionId, (int)$ownerId]);
        }
    }

    $pdo->commit();
    echo json_encode(['success' => true]);
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    error_log('personas_update failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
}
