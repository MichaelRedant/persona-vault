<?php
header('Content-Type: application/json');
include 'cors.php';
include 'db.php';
require_once 'config.php';
require_once 'jwt_utils.php';

$JWT_SECRET = JWT_SECRET;

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

// User ophalen (inclusief admin-flag)
$stmt = $pdo->prepare("SELECT id, username, password_hash, is_admin FROM users WHERE email = ? OR username = ?");
$stmt->execute([$email, $email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user || !password_verify($password, $user['password_hash'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid email or password']);
    exit;
}

// Workspace ophalen
$wsStmt = $pdo->prepare("
    SELECT w.id 
    FROM workspaces w
    JOIN workspace_members wm ON wm.workspace_id = w.id
    WHERE wm.user_id = ? 
    ORDER BY w.created_at ASC 
    LIMIT 1
");
$wsStmt->execute([$user['id']]);
$workspaceId = $wsStmt->fetchColumn();

if (!$workspaceId) {
    http_response_code(500);
    echo json_encode(['error' => 'No workspace found for user']);
    exit;
}

// Log login time for user session tracking
try {

    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS user_sessions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            login_time DATETIME NOT NULL,
            logout_time DATETIME DEFAULT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )"
    );

    $sessionStmt = $pdo->prepare("INSERT INTO user_sessions (user_id, login_time) VALUES (?, NOW())");
    $sessionStmt->execute([$user['id']]);
} catch (PDOException $e) {
    // If session logging fails, continue without blocking login
    error_log('Session log failed: ' . $e->getMessage());

}

// ✅ JWT genereren (met admin-info)
$token = generate_jwt([
    'user_id' => $user['id'],
    'username' => $user['username'],
    'workspace_id' => $workspaceId,
    'is_admin' => (int)$user['is_admin']
], 3600 * 24 * 7);

echo json_encode(['success' => true, 'token' => trim($token)]);
exit;

