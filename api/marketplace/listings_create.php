<?php
declare(strict_types=1);

require __DIR__ . '/../cors.php';
require __DIR__ . '/../db.php';
require __DIR__ . '/../auth_check.php'; // sets $user_id, $workspace_id, $is_admin
require __DIR__ . '/listings_guard.php';
require __DIR__ . '/audit_utils.php';
require_workspace_permission('editor');

header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    marketplace_fail(400, 'Invalid JSON payload');
}

$itemTypeRaw = trim((string)($input['item_type'] ?? ''));
$itemType = strtolower($itemTypeRaw);
$itemId = (int)($input['item_id'] ?? 0);
$title = marketplace_validate_title($input['title'] ?? '');
$description = marketplace_validate_description($input['description'] ?? '');
$priceCents = marketplace_validate_price_cents($input['price_cents'] ?? 0);
$currency = marketplace_validate_currency($input['currency'] ?? 'EUR');
$visibility = marketplace_validate_visibility($input['visibility'] ?? 'public');
$tags = marketplace_validate_tags($input['tags'] ?? '');
$coverFileId = marketplace_normalize_cover_file_id($input['cover_file_id'] ?? null);

if ($itemId <= 0) {
    marketplace_fail(422, 'Missing item_id');
}

if (marketplace_item_owner_query($itemType) === null) {
    marketplace_fail(422, 'Invalid item_type');
}

try {
    $isAdmin = (bool)($is_admin ?? false);
    $workspaceId = (int)$workspace_id;
    $actorUserId = (int)$user_id;

    marketplace_assert_source_item_owned(
        $pdo,
        $itemType,
        $itemId,
        $workspaceId,
        $actorUserId,
        $isAdmin
    );
    marketplace_assert_cover_file_owned(
        $pdo,
        $coverFileId,
        $workspaceId,
        $actorUserId,
        $isAdmin
    );

    $pdo->beginTransaction();

    $stmt = $pdo->prepare(
        'INSERT INTO marketplace_listings
        (seller_user_id, workspace_id, item_type, item_id, title, description, price_cents, currency, status, visibility, tags, cover_file_id, published_at)
        VALUES (:seller, :ws, :type, :item, :title, :description, :price_cents, :currency, :status, :visibility, :tags, :cover_file_id, NOW())'
    );

    $stmt->execute([
        ':seller' => $actorUserId,
        ':ws' => $workspaceId,
        ':type' => $itemType,
        ':item' => $itemId,
        ':title' => $title,
        ':description' => $description,
        ':price_cents' => $priceCents,
        ':currency' => $currency,
        ':status' => 'active',
        ':visibility' => $visibility,
        ':tags' => $tags,
        ':cover_file_id' => $coverFileId,
    ]);

    $listingId = (int)$pdo->lastInsertId();
    marketplace_log_listing_event(
        $pdo,
        $listingId,
        $workspaceId,
        $actorUserId,
        'created',
        [
            'title' => $title,
            'item_type' => $itemType,
            'item_id' => $itemId,
            'status' => 'active',
            'visibility' => $visibility,
        ]
    );

    $pdo->commit();

    echo json_encode(['success' => true, 'id' => $listingId]);
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'DB error']);
}
