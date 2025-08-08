<?php
header('Content-Type: application/json');
include 'cors.php';
include 'db.php';
require_once 'auth_check.php';

$stmt = $pdo->prepare('SELECT username, email, profile_name, address, role, photo FROM users WHERE id = ?');
$stmt->execute([$user_id]);
$profile = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$profile) {
    http_response_code(404);
    echo json_encode(['error' => 'User not found']);
    exit;
}

echo json_encode(['success' => true, 'profile' => $profile]);
