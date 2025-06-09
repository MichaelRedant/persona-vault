<?php
header('Content-Type: application/json');
include 'cors.php';
include 'db.php';


include 'jwt_utils.php';

// Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

$email = $data['email'] ?? '';
$password = $data['password'] ?? '';

if (!$email || !$password) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing email or password']);
    exit;
}

// Fetch user
$stmt = $pdo->prepare("SELECT id, password_hash FROM users WHERE emailIndex = ?");
$stmt->execute([$email]);

$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user || !password_verify($password, $user['password_hash'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid credentials']);
    exit;
}

// Create JWT
$token = generate_jwt(['user_id' => $user['id'], 'email' => $email], $JWT_SECRET);

echo json_encode(['success' => true, 'token' => $token]);
