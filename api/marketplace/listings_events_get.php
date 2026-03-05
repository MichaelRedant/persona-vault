<?php
declare(strict_types=1);

require __DIR__ . '/../cors.php';
require __DIR__ . '/../db.php';
require __DIR__ . '/../auth_check.php';
require __DIR__ . '/listings_guard.php';
require __DIR__ . '/audit_utils.php';
require_workspace_permission('viewer');

header('Content-Type: application/json');

$listingId = (int)($_GET['listing_id'] ?? 0);
if ($listingId <= 0) {
    marketplace_fail(422, 'Missing listing_id');
}

$limit = max(1, min(100, (int)($_GET['limit'] ?? 25)));
$workspaceId = (int)$workspace_id;

try {
    marketplace_ensure_listing_events_table($pdo);

    $listing = marketplace_get_listing_for_workspace($pdo, $listingId, $workspaceId);
    if (!is_array($listing)) {
        $existsStmt = $pdo->prepare(
            'SELECT 1
             FROM marketplace_listing_events
             WHERE listing_id = ? AND workspace_id = ?
             LIMIT 1'
        );
        $existsStmt->execute([$listingId, $workspaceId]);
        if (!$existsStmt->fetchColumn()) {
            marketplace_fail(404, 'Listing not found');
        }
    }

    $stmt = $pdo->prepare(
        'SELECT e.id,
                e.listing_id,
                e.event_type,
                e.payload_json,
                e.created_at,
                e.actor_user_id,
                u.username AS actor_name
         FROM marketplace_listing_events e
         LEFT JOIN users u ON u.id = e.actor_user_id
         WHERE e.workspace_id = ?
           AND e.listing_id = ?
         ORDER BY e.created_at DESC
         LIMIT ' . $limit
    );
    $stmt->execute([$workspaceId, $listingId]);

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    if (!is_array($rows)) {
        $rows = [];
    }

    $items = [];
    foreach ($rows as $row) {
        $payload = [];
        $rawPayload = (string)($row['payload_json'] ?? '');
        if ($rawPayload !== '') {
            $decoded = json_decode($rawPayload, true);
            if (is_array($decoded)) {
                $payload = $decoded;
            }
        }

        $items[] = [
            'id' => (int)$row['id'],
            'listing_id' => (int)$row['listing_id'],
            'event_type' => (string)$row['event_type'],
            'created_at' => (string)$row['created_at'],
            'actor_user_id' => $row['actor_user_id'] !== null ? (int)$row['actor_user_id'] : null,
            'actor_name' => $row['actor_name'] !== null ? (string)$row['actor_name'] : null,
            'payload' => $payload,
        ];
    }

    echo json_encode([
        'success' => true,
        'items' => $items,
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'DB error']);
}

