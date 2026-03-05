<?php
declare(strict_types=1);

header('Content-Type: application/json');
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth_check.php';
require_once __DIR__ . '/sanitize_html.php';

try {
    $stmt = $pdo->prepare(
        'SELECT id, user_id, workspace_id, title, content, category, favorite, tags, created_at, updated_at
         FROM prompts
         WHERE user_id = ? AND workspace_id = ?
         ORDER BY created_at DESC'
    );
    $stmt->execute([$user_id, $workspace_id]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $prompts = array_map(
        static function (array $row): array {
            $tagsArray = $row['tags'] ? explode(',', (string)$row['tags']) : [];
            $row['title'] = pv_sanitize_text((string)$row['title'], 180);
            $row['content'] = pv_sanitize_html((string)$row['content']);
            $row['category'] = pv_sanitize_text((string)$row['category'], 120);
            $row['tags'] = pv_tags_to_csv(pv_sanitize_tag_list($tagsArray));
            $row['favorite'] = (int)$row['favorite'];
            $row['id'] = (int)$row['id'];
            $row['user_id'] = (int)$row['user_id'];
            $row['workspace_id'] = (int)$row['workspace_id'];
            return $row;
        },
        $rows
    );

    echo json_encode($prompts);
} catch (PDOException $e) {
    error_log('prompts_get failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch prompts']);
}
