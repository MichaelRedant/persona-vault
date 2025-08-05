<?php
header('Content-Type: application/json');
include 'cors.php';
include 'db.php';
require 'auth_check.php'; // ✅ haalt $user_id & $workspace_id veilig op

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

$title = $data['title'] ?? '';
$content = $data['content'] ?? '';
$category = $data['category'] ?? '';
$tags = isset($data['tags']) && is_array($data['tags'])
    ? implode(',', array_map('trim', $data['tags']))
    : '';

if (!$title || !$content) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing title or content']);
    exit;
}

try {
    $stmt = $pdo->prepare("
        INSERT INTO prompts (user_id, workspace_id, title, content, category, tags) 
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$user_id, $workspace_id, $title, $content, $category, $tags]);

    echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
