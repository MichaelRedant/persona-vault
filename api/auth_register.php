<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');
include 'cors.php';
include 'db.php';
require_once 'jwt_utils.php';
require_once 'config.php';

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Read input
$data = json_decode(file_get_contents('php://input'), true);

$username = trim($data['username'] ?? '');
$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

// Basic validation
if (!$username || !$email || !$password) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing username, email or password']);
    exit;
}

// Check if email already exists
$stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute([$email]);

if ($stmt->fetch()) {
    http_response_code(409);
    echo json_encode(['error' => 'Email already registered']);
    exit;
}

// Hash password
$password_hash = password_hash($password, PASSWORD_DEFAULT);

// Insert user (default not admin)
$stmt = $pdo->prepare("INSERT INTO users (username, email, password_hash, is_admin) VALUES (?, ?, ?, 0)");
$stmt->execute([$username, $email, $password_hash]);

$user_id = $pdo->lastInsertId();

// Create default workspace
$workspaceStmt = $pdo->prepare("INSERT INTO workspaces (name, owner_id) VALUES (?, ?)");
$workspaceStmt->execute(["{$username}'s Workspace", $user_id]);
$workspaceId = $pdo->lastInsertId();

// Add user as admin
$memberStmt = $pdo->prepare("INSERT INTO workspace_members (workspace_id, user_id, role) VALUES (?, ?, 'admin')");
$memberStmt->execute([$workspaceId, $user_id]);

// Genereer JWT
$token = generate_jwt([
    'user_id' => $user_id,
    'username' => $username,
    'workspace_id' => $workspaceId,
    'is_admin' => 0
], 3600 * 24 * 7);

echo json_encode(['success' => true, 'token' => $token]);
