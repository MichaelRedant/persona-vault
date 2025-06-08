<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
include 'db.php';
// Handle preflight request
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
$tags = isset($data['tags']) ? implode(',', $data['tags']) : '';

$stmt = $pdo->prepare("UPDATE prompts SET title = ?, content = ?, category = ?, favorite = ?, tags = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
$stmt->execute([$title, $content, $category, $favorite, $tags, $id]);

echo json_encode(['success' => true]);
?>
