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

$name = pv_sanitize_text((string)($data['name'] ?? ''), 120);
$rawDescription = (string)($data['description'] ?? '');
$description = pv_sanitize_html($rawDescription);
$plainDescription = trim(html_entity_decode(strip_tags($description), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'));

if ($description === '' && trim(pv_sanitize_text($rawDescription, 20000)) !== '') {
    $escaped = htmlspecialchars(pv_normalize_utf8($rawDescription), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $description = '<p>' . nl2br($escaped, false) . '</p>';
    $plainDescription = trim(html_entity_decode(strip_tags($description), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'));
}

$tags = pv_tags_to_csv(pv_sanitize_tag_list($data['tags'] ?? []));

$collectionIds = isset($data['collection_ids']) && is_array($data['collection_ids'])
    ? array_filter(array_map('intval', $data['collection_ids']), static fn(int $id): bool => $id > 0)
    : [];

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

    $insertColumns = ['user_id', 'workspace_id', 'name', 'tags'];
    $params = [$user_id, $workspace_id, $name, $tags];
    if ($hasDescriptionColumn) {
        $insertColumns[] = 'description';
        $params[] = $description;
    }
    if ($hasContentColumn) {
        $insertColumns[] = 'content';
        $params[] = $description;
    }

    $placeholders = implode(', ', array_fill(0, count($insertColumns), '?'));
    $stmt = $pdo->prepare(
        'INSERT INTO personas (' . implode(', ', $insertColumns) . ') VALUES (' . $placeholders . ')'
    );
    $stmt->execute($params);
    $personaId = (int)$pdo->lastInsertId();

    if (!empty($collectionIds)) {
        $assocStmt = $pdo->prepare(
            'INSERT INTO persona_collections (persona_id, collection_id, user_id) VALUES (?, ?, ?)'
        );
        foreach ($collectionIds as $collectionId) {
            $assocStmt->execute([$personaId, $collectionId, $user_id]);
        }
    }

    echo json_encode(['success' => true, 'id' => $personaId]);
} catch (Throwable $e) {
    error_log('personas_create failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
}
