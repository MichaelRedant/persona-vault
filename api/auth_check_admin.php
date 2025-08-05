<?php
require_once 'auth_check.php'; // sets $user_id and $workspace_id

// Controleer of gebruiker admin is
$stmt = $pdo->prepare("SELECT is_admin FROM users WHERE id = ?");
$stmt->execute([$user_id]);
$is_admin = $stmt->fetchColumn();

if (!$is_admin) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Admin privileges required']);
    exit;
}
