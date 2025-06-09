<?php
header('Content-Type: application/json');
include 'cors.php';
include 'db.php';
require_once 'config.php';
require_once 'jwt_utils.php';

$JWT_SECRET = JWT_SECRET;
// Handle preflight request
if (!$JWT_SECRET) {
    http_response_code(500);
    echo json_encode(['error' => 'JWT secret not configured']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

if (!$email || !$password) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing email or password']);
    exit;
}

// Get user
$stmt = $pdo->prepare("SELECT id, username, password_hash FROM users WHERE email = ? OR username = ?");
$stmt->execute([$email, $email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user || !password_verify($password, $user['password_hash'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid email or password']);
    exit;
}

// Generate JWT
$token = generate_jwt([
  'user_id' => $user['id'],
  'username' => $user['username']
], 3600 * 24 * 7);



echo json_encode(['success' => true, 'token' => trim($token)]);

