<?php
declare(strict_types=1);

require __DIR__ . '/../cors.php';
require __DIR__ . '/../db.php';
require __DIR__ . '/../auth_check.php';
require __DIR__ . '/listings_guard.php';
require __DIR__ . '/reports_utils.php';
require __DIR__ . '/audit_utils.php';
require_workspace_permission('viewer');

header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    marketplace_fail(400, 'Invalid JSON payload');
}

$listingId = (int)($input['listing_id'] ?? 0);
if ($listingId <= 0) {
    marketplace_fail(422, 'Missing listing_id');
}

$reason = marketplace_validate_report_reason($input['reason'] ?? '');
$details = marketplace_validate_report_details($input['details'] ?? '');

try {
    marketplace_ensure_reports_table($pdo);

    $listingStmt = $pdo->prepare(
        'SELECT id, workspace_id, seller_user_id
         FROM marketplace_listings
         WHERE id = ?
         LIMIT 1'
    );
    $listingStmt->execute([$listingId]);
    $listing = $listingStmt->fetch(PDO::FETCH_ASSOC);
    if (!is_array($listing)) {
        marketplace_fail(404, 'Listing not found');
    }

    $listingWorkspaceId = (int)$listing['workspace_id'];
    $listingOwnerId = (int)$listing['seller_user_id'];
    if ($listingOwnerId === (int)$user_id) {
        marketplace_fail(409, 'You cannot report your own listing');
    }

    $dedupeStmt = $pdo->prepare(
        'SELECT id
         FROM marketplace_listing_reports
         WHERE listing_id = ?
           AND reporter_user_id = ?
           AND status = ?
           AND created_at >= (NOW() - INTERVAL 24 HOUR)
         LIMIT 1'
    );
    $dedupeStmt->execute([$listingId, (int)$user_id, 'open']);
    if ($dedupeStmt->fetchColumn()) {
        marketplace_fail(409, 'You already reported this listing recently');
    }

    $pdo->beginTransaction();

    $insertStmt = $pdo->prepare(
        'INSERT INTO marketplace_listing_reports
        (listing_id, workspace_id, reporter_user_id, listing_owner_user_id, reason, details, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    $insertStmt->execute([
        $listingId,
        $listingWorkspaceId,
        (int)$user_id,
        $listingOwnerId,
        $reason,
        $details,
        'open',
    ]);

    $reportId = (int)$pdo->lastInsertId();

    marketplace_log_listing_event(
        $pdo,
        $listingId,
        $listingWorkspaceId,
        (int)$user_id,
        'reported',
        [
            'report_id' => $reportId,
            'reason' => $reason,
        ]
    );

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'report_id' => $reportId,
    ]);
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'DB error']);
}
