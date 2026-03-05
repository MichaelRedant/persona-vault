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

$title = pv_sanitize_text((string)($data['title'] ?? ''), 180);
$content = pv_sanitize_html((string)($data['content'] ?? ''));
$category = pv_sanitize_text((string)($data['category'] ?? ''), 120);
$tags = pv_tags_to_csv(pv_sanitize_tag_list($data['tags'] ?? []));

if ($title === '' || $content === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Missing title or content']);
    exit;
}

try {
    $stmt = $pdo->prepare(
        'INSERT INTO prompts (user_id, workspace_id, title, content, category, tags)
         VALUES (?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([$user_id, $workspace_id, $title, $content, $category, $tags]);

    echo json_encode(['success' => true, 'id' => (int)$pdo->lastInsertId()]);
} catch (PDOException $e) {
    error_log('prompts_create failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
}
