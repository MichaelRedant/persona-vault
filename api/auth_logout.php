<?php
require 'cors.php';
require 'db.php';
require 'auth_check.php';

header('Content-Type: application/json');

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

    $stmt = $pdo->prepare(
        "UPDATE user_sessions SET logout_time = NOW() WHERE user_id = ? AND logout_time IS NULL ORDER BY login_time DESC LIMIT 1"
    );

    $stmt->execute([$user_id]);
    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
