<?php
header('Content-Type: application/json');
require 'cors.php';
require 'auth_check.php'; // ✅ Haalt $user_id en $workspace_id op uit JWT
require 'db.php';

$id = $_GET['id'] ?? 0;

if (!$id || !is_numeric($id)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid collection id']);
    exit;
}

// ✅ Verwijder enkel als de collection toebehoort aan deze user én workspace
$stmt = $pdo->prepare("
    DELETE FROM collections 
    WHERE id = ? AND user_id = ? AND workspace_id = ?
");
$stmt->execute([$id, $user_id, $workspace_id]);

echo json_encode(['success' => true]);
