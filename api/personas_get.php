<?php
declare(strict_types=1);

header('Content-Type: application/json');
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth_check.php';
require_once __DIR__ . '/sanitize_html.php';
require_once __DIR__ . '/revisions_utils.php';

try {
    $personaColumns = pv_get_table_columns($pdo, 'personas');
    $hasDescriptionColumn = in_array('description', $personaColumns, true);
    $hasContentColumn = in_array('content', $personaColumns, true);

    if ($hasDescriptionColumn && $hasContentColumn) {
        $descriptionSelect = "COALESCE(NULLIF(p.description, ''), p.content) AS description";
    } elseif ($hasDescriptionColumn) {
        $descriptionSelect = 'p.description AS description';
    } elseif ($hasContentColumn) {
        $descriptionSelect = 'p.content AS description';
    } else {
        $descriptionSelect = "'' AS description";
    }

    $stmt = $pdo->prepare(
        'SELECT
            p.id,
            p.name,
            ' . $descriptionSelect . ',
            p.favorite,
            p.tags,
            p.created_at,
            p.updated_at,
            pc.collection_id
         FROM personas p
         LEFT JOIN persona_collections pc ON p.id = pc.persona_id
         WHERE p.user_id = ? AND p.workspace_id = ?
         ORDER BY p.created_at DESC'
    );
    $stmt->execute([$user_id, $workspace_id]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $personasMap = [];
    foreach ($rows as $row) {
        $id = (int)$row['id'];

        if (!isset($personasMap[$id])) {
            $tags = $row['tags'] ? explode(',', (string)$row['tags']) : [];
            $personasMap[$id] = [
                'id' => $id,
                'name' => pv_sanitize_text((string)$row['name'], 120),
                // Preserve stored rich content for editor/card rendering.
                // Content is sanitized on write and sanitized again in frontend renderers.
                'description' => pv_normalize_utf8((string)$row['description']),
                'favorite' => (int)$row['favorite'],
                'tags' => pv_sanitize_tag_list($tags),
                'collection_names' => [],
                'created_at' => $row['created_at'],
                'updated_at' => $row['updated_at'],
                'collection_ids' => [],
            ];
        }

        if ($row['collection_id'] !== null) {
            $personasMap[$id]['collection_ids'][] = (int)$row['collection_id'];
            $personasMap[$id]['collection_ids'] = array_values(array_unique($personasMap[$id]['collection_ids']));
        }
    }

    echo json_encode(array_values($personasMap));
} catch (PDOException $e) {
    error_log('personas_get failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch personas']);
}
