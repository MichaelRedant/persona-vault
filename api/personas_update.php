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
$name = $data['name'] ?? '';
$description = $data['description'] ?? '';
$favorite = isset($data['favorite']) ? (int)$data['favorite'] : 0;
$tags = isset($data['tags']) && is_array($data['tags'])
    ? implode(',', array_map('trim', $data['tags']))
    : '';

$stmt = $pdo->prepare("UPDATE personas SET name = ?, description = ?, favorite = ?, tags = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
$stmt->execute([$name, $description, $favorite, $tags, $id]);

echo json_encode(['success' => true]);

?>
