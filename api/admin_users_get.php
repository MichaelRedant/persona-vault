<?php
require 'cors.php';
require 'db.php';
require 'auth_check_admin.php';

header('Content-Type: application/json');

try {
    $stmt = $pdo->query("SELECT id, username, email FROM users ORDER BY username ASC");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'users' => $users]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
