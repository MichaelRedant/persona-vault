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

$title = $data['title'] ?? '';
$content = $data['content'] ?? '';
$category = $data['category'] ?? '';

$tags = isset($data['tags']) && is_array($data['tags'])
    ? implode(',', array_map('trim', $data['tags']))
    : '';

// INSERT with tags included
$stmt = $pdo->prepare("INSERT INTO prompts (title, content, category, tags) VALUES (?, ?, ?, ?)");
$stmt->execute([$title, $content, $category, $tags]);

echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);