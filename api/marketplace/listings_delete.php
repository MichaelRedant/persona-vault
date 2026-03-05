<?php
declare(strict_types=1);

require __DIR__ . '/../cors.php';
require __DIR__ . '/../db.php';
require __DIR__ . '/../auth_check.php';
require __DIR__ . '/listings_guard.php';
require __DIR__ . '/audit_utils.php';
require_workspace_permission('editor');

header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    marketplace_fail(400, 'Invalid JSON payload');
}

$id = (int)($input['id'] ?? 0);
if ($id <= 0) {
    marketplace_fail(422, 'Missing id');
}

try {
    $workspaceId = (int)$workspace_id;
    $actorUserId = (int)$user_id;
    $isAdmin = (bool)($is_admin ?? false);

    $listing = marketplace_get_listing_for_workspace($pdo, $id, $workspaceId);
    marketplace_assert_listing_owner($listing, $actorUserId, $isAdmin);

    $pdo->beginTransaction();

    marketplace_log_listing_event(
        $pdo,
        $id,
        $workspaceId,
        $actorUserId,
        'deleted',
        [
            'title' => (string)($listing['title'] ?? ''),
            'status' => (string)($listing['status'] ?? ''),
            'visibility' => (string)($listing['visibility'] ?? ''),
            'item_type' => (string)($listing['item_type'] ?? ''),
            'item_id' => isset($listing['item_id']) ? (int)$listing['item_id'] : null,
        ]
    );

    $deleteStmt = $pdo->prepare('DELETE FROM marketplace_listings WHERE id = ? AND workspace_id = ?');
    $deleteStmt->execute([$id, $workspaceId]);

    $pdo->commit();

    echo json_encode(['success' => true]);
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'DB error']);
}
