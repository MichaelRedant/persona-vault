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
    $isAdmin = (bool)($is_admin ?? false);
    $workspaceId = (int)$workspace_id;
    $userId = (int)$user_id;

    $listing = marketplace_get_listing_for_workspace($pdo, $id, $workspaceId);
    marketplace_assert_listing_owner($listing, $userId, $isAdmin);
    marketplace_assert_listing_source_integrity($pdo, $listing, $workspaceId);

    $snapshotStmt = $pdo->prepare(
        'SELECT id, title, description, tags, visibility, status, price_cents, currency, cover_file_id
         FROM marketplace_listings
         WHERE id = ? AND workspace_id = ?
         LIMIT 1'
    );
    $snapshotStmt->execute([$id, $workspaceId]);
    $before = $snapshotStmt->fetch(PDO::FETCH_ASSOC);
    if (!is_array($before)) {
        marketplace_fail(404, 'Listing not found');
    }

    $fields = [];
    $newValues = [];
    $params = [
        ':id' => $id,
        ':workspace_id' => $workspaceId,
    ];

    if (array_key_exists('title', $input)) {
        $fields[] = 'title = :title';
        $value = marketplace_validate_title($input['title']);
        $params[':title'] = $value;
        $newValues['title'] = $value;
    }

    if (array_key_exists('description', $input)) {
        $fields[] = 'description = :description';
        $value = marketplace_validate_description($input['description']);
        $params[':description'] = $value;
        $newValues['description'] = $value;
    }

    if (array_key_exists('tags', $input)) {
        $fields[] = 'tags = :tags';
        $value = marketplace_validate_tags($input['tags']);
        $params[':tags'] = $value;
        $newValues['tags'] = $value;
    }

    if (array_key_exists('visibility', $input)) {
        $fields[] = 'visibility = :visibility';
        $value = marketplace_validate_visibility($input['visibility']);
        $params[':visibility'] = $value;
        $newValues['visibility'] = $value;
    }

    if (array_key_exists('status', $input)) {
        $fields[] = 'status = :status';
        $value = marketplace_validate_status($input['status']);
        $params[':status'] = $value;
        $newValues['status'] = $value;
    }

    if (array_key_exists('price_cents', $input)) {
        $fields[] = 'price_cents = :price_cents';
        $value = marketplace_validate_price_cents($input['price_cents']);
        $params[':price_cents'] = $value;
        $newValues['price_cents'] = $value;
    }

    if (array_key_exists('currency', $input)) {
        $fields[] = 'currency = :currency';
        $value = marketplace_validate_currency($input['currency']);
        $params[':currency'] = $value;
        $newValues['currency'] = $value;
    }

    if (array_key_exists('cover_file_id', $input)) {
        $coverFileId = marketplace_normalize_cover_file_id($input['cover_file_id']);
        marketplace_assert_cover_file_owned($pdo, $coverFileId, $workspaceId, $userId, $isAdmin);
        $fields[] = 'cover_file_id = :cover_file_id';
        $params[':cover_file_id'] = $coverFileId;
        $newValues['cover_file_id'] = $coverFileId;
    }

    if (count($fields) === 0) {
        echo json_encode(['success' => true]);
        exit;
    }

    $pdo->beginTransaction();

    $sql = 'UPDATE marketplace_listings SET ' . implode(', ', $fields) . ' WHERE id = :id AND workspace_id = :workspace_id';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    $changes = [];
    foreach ($newValues as $field => $toValue) {
        $fromValue = $before[$field] ?? null;
        $normalizedFrom = $fromValue;
        if (in_array($field, ['price_cents', 'cover_file_id'], true) && $fromValue !== null) {
            $normalizedFrom = (int)$fromValue;
        }

        if ($normalizedFrom !== $toValue) {
            $changes[$field] = [
                'from' => $normalizedFrom,
                'to' => $toValue,
            ];
        }
    }

    if ($changes !== []) {
        marketplace_log_listing_event(
            $pdo,
            $id,
            $workspaceId,
            $userId,
            'updated',
            ['changes' => $changes]
        );
    }

    $pdo->commit();

    echo json_encode(['success' => true]);
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'DB error']);
}
