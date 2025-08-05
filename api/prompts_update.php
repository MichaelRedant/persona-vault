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
$stmt = $pdo->prepare("
    UPDATE prompts 
    SET title = ?, content = ?, category = ?, favorite = ?, tags = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ? AND user_id = ? AND workspace_id = ?
");
$stmt->execute([$title, $content, $category, $favorite, $tags, $id, $user_id, $workspace_id]);

echo json_encode(['success' => true]);
