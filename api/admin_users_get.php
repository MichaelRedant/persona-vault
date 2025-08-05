<?php
require 'cors.php';
require 'db.php';
require 'auth_check_admin.php';

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

    $stmt = $pdo->query("SELECT id, username, email, is_admin FROM users ORDER BY username ASC");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($users as &$user) {
        $user_id = (int)$user['id'];

        $personaCount = $pdo->prepare("SELECT COUNT(*) FROM personas WHERE user_id = ?");
        $personaCount->execute([$user_id]);
        $user['persona_count'] = (int)$personaCount->fetchColumn();

        $promptCount = $pdo->prepare("SELECT COUNT(*) FROM prompts WHERE user_id = ?");
        $promptCount->execute([$user_id]);
        $user['prompt_count'] = (int)$promptCount->fetchColumn();

        $collectionCount = $pdo->prepare("SELECT COUNT(*) FROM collections WHERE user_id = ?");
        $collectionCount->execute([$user_id]);
        $user['collection_count'] = (int)$collectionCount->fetchColumn();

        $workspaceCount = $pdo->prepare("SELECT COUNT(*) FROM workspace_members WHERE user_id = ?");
        $workspaceCount->execute([$user_id]);
        $user['workspace_count'] = (int)$workspaceCount->fetchColumn();

        // Login frequency and session duration
        $sessionStats = $pdo->prepare("SELECT COUNT(*) AS login_count, AVG(TIMESTAMPDIFF(MINUTE, login_time, IFNULL(logout_time, NOW()))) AS avg_minutes FROM user_sessions WHERE user_id = ?");
        $sessionStats->execute([$user_id]);
        $stats = $sessionStats->fetch(PDO::FETCH_ASSOC);
        $user['login_count'] = (int)($stats['login_count'] ?? 0);
        $user['avg_session_minutes'] = $stats['avg_minutes'] !== null ? (float)$stats['avg_minutes'] : 0;

        $user['is_admin'] = (bool)$user['is_admin'];
    }

    echo json_encode(['success' => true, 'users' => $users]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
