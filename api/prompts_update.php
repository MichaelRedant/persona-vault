<?php
header('Content-Type: application/json');
include 'cors.php';
require 'auth_check.php'; // ✅ haalt $user_id en $workspace_id op
include 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

$id = $data['id'] ?? 0;
$title = $data['title'] ?? '';
$content = $data['content'] ?? '';
$category = $data['category'] ?? '';
$favorite = isset($data['favorite']) ? (int)$data['favorite'] : 0;
$tags = isset($data['tags']) && is_array($data['tags'])
    ? implode(',', array_map('trim', $data['tags']))
    : '';

// ✅ Update prompt met gebruikers- én workspace-check
$params = [$title, $content, $category, $favorite, $tags, $id];
if ($is_admin) {
    $stmt = $pdo->prepare("
        UPDATE prompts
        SET title = ?, content = ?, category = ?, favorite = ?, tags = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND workspace_id = ?
    ");
    $params[] = $workspace_id;
    $stmt->execute($params);
    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Prompt not found']);
        exit;
    }
} else {
    $stmt = $pdo->prepare("
        UPDATE prompts
        SET title = ?, content = ?, category = ?, favorite = ?, tags = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND user_id = ? AND workspace_id = ?
    ");
    $params[] = $user_id;
    $params[] = $workspace_id;
    $stmt->execute($params);
    if ($stmt->rowCount() === 0) {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden: You do not have access to this prompt']);
        exit;
    }
}

echo json_encode(['success' => true]);
