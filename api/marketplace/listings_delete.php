<?php
declare(strict_types=1);
require __DIR__ . '/../cors.php';
require __DIR__ . '/../db.php';
require __DIR__ . '/../auth_check.php';

header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);
$id = (int)($input['id'] ?? 0);
if ($id <= 0) {
    http_response_code(422);
    echo json_encode(['success' => false, 'error' => 'Missing id']);
    exit;
}

try {
    $stmt = $pdo->prepare('SELECT seller_user_id FROM marketplace_listings WHERE id = ?');
    $stmt->execute([$id]);
    $owner = $stmt->fetchColumn();
    if (!$owner) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Listing not found']);
        exit;
    }

    if ((int)$owner !== (int)$user_id) {
        $chk = $pdo->prepare('SELECT is_admin FROM users WHERE id = ?');
        $chk->execute([$user_id]);
        $isAdmin = (bool)$chk->fetchColumn();
        if (!$isAdmin) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'Not allowed']);
            exit;
        }
    }

    $del = $pdo->prepare('DELETE FROM marketplace_listings WHERE id = ?');
    $del->execute([$id]);

    echo json_encode(['success' => true]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'DB error']);
}
