<?php
declare(strict_types=1);

require __DIR__ . '/../cors.php';
require __DIR__ . '/../db.php';
require __DIR__ . '/../auth_check.php';
require __DIR__ . '/listings_guard.php';
require __DIR__ . '/reports_utils.php';
require __DIR__ . '/audit_utils.php';
require_workspace_permission('editor');

header('Content-Type: application/json');

marketplace_assert_can_moderate_reports();

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    marketplace_fail(400, 'Invalid JSON payload');
}

$reportId = (int)($input['report_id'] ?? 0);
if ($reportId <= 0) {
    marketplace_fail(422, 'Missing report_id');
}

$reportStatus = marketplace_validate_report_status($input['report_status'] ?? 'reviewed');
$listingStatus = null;
if (array_key_exists('listing_status', $input)) {
    $listingStatus = marketplace_validate_status($input['listing_status']);
}

try {
    marketplace_ensure_reports_table($pdo);

    $reportStmt = $pdo->prepare(
        'SELECT id, listing_id, status
         FROM marketplace_listing_reports
         WHERE id = ? AND workspace_id = ?
         LIMIT 1'
    );
    $reportStmt->execute([$reportId, (int)$workspace_id]);
    $report = $reportStmt->fetch(PDO::FETCH_ASSOC);

    if (!is_array($report)) {
        marketplace_fail(404, 'Report not found');
    }

    $pdo->beginTransaction();

    $resolveStmt = $pdo->prepare(
        'UPDATE marketplace_listing_reports
         SET status = ?,
             resolved_at = CASE WHEN ? = "open" THEN NULL ELSE NOW() END,
             resolved_by_user_id = CASE WHEN ? = "open" THEN NULL ELSE ? END
         WHERE id = ? AND workspace_id = ?'
    );
    $resolveStmt->execute([
        $reportStatus,
        $reportStatus,
        $reportStatus,
        (int)$user_id,
        $reportId,
        (int)$workspace_id,
    ]);

    $listingStatusFrom = null;
    if ($listingStatus !== null) {
        $beforeStatusStmt = $pdo->prepare(
            'SELECT status
             FROM marketplace_listings
             WHERE id = ? AND workspace_id = ?
             LIMIT 1'
        );
        $beforeStatusStmt->execute([(int)$report['listing_id'], (int)$workspace_id]);
        $listingStatusFromRaw = $beforeStatusStmt->fetchColumn();
        if (is_string($listingStatusFromRaw)) {
            $listingStatusFrom = $listingStatusFromRaw;
        }

        $listingStmt = $pdo->prepare(
            'UPDATE marketplace_listings
             SET status = ?
             WHERE id = ? AND workspace_id = ?'
        );
        $listingStmt->execute([$listingStatus, (int)$report['listing_id'], (int)$workspace_id]);
    }

    $eventPayload = [
        'report_id' => $reportId,
        'report_status_from' => (string)$report['status'],
        'report_status_to' => $reportStatus,
    ];

    if ($listingStatus !== null) {
        $eventPayload['listing_status_from'] = $listingStatusFrom;
        $eventPayload['listing_status_to'] = $listingStatus;
    }

    marketplace_log_listing_event(
        $pdo,
        (int)$report['listing_id'],
        (int)$workspace_id,
        (int)$user_id,
        'report_resolved',
        $eventPayload
    );

    $pdo->commit();

    echo json_encode(['success' => true]);
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'DB error']);
}
