<?php
header('Content-Type: application/json');
include 'cors.php';
require 'auth_check.php';
require 'db.php';

$data = json_decode(file_get_contents('php://input'), true);
$id = $data['id'] ?? 0;
$name = trim($data['name'] ?? '');

if (!$id || empty($name)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid id or name']);
    exit;
}

try {
    $stmt = $pdo->prepare("UPDATE collections SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ? AND workspace_id = ?");
    $stmt->execute([$name, $id, $user_id, $workspace_id]);

    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Collection not found']);
        exit;
    }

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
