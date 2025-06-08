<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: POST, OPTIONS');

include 'db.php';

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

$id = $data['id'] ?? 0;
$favorite = isset($data['favorite']) ? (int)$data['favorite'] : 0;

// Basic validation
if ($id === 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing or invalid prompt ID.']);
    exit;
}

try {
    $stmt = $pdo->prepare("UPDATE prompts SET favorite = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
    $stmt->execute([$favorite, $id]);

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to update favorite: ' . $e->getMessage()]);
}
?>
