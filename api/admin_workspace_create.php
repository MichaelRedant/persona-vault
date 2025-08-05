<?php
require 'cors.php';
require 'db.php';
require 'auth_check_admin.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$name = trim($data['name'] ?? '');
$owner_id = $data['owner_id'] ?? null;

if (!$name || !$owner_id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Workspace name and owner_id are required']);
    exit;
}

try {
    $stmt = $pdo->prepare("INSERT INTO workspaces (name, owner_id) VALUES (?, ?)");
    $stmt->execute([$name, $owner_id]);
    $workspace_id = $pdo->lastInsertId();

    // Voeg owner toe als admin member
    $stmt = $pdo->prepare("INSERT INTO workspace_members (workspace_id, user_id, role) VALUES (?, ?, 'admin')");
    $stmt->execute([$workspace_id, $owner_id]);

    echo json_encode(['success' => true, 'workspace_id' => $workspace_id]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
