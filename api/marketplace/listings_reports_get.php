<?php
declare(strict_types=1);

require __DIR__ . '/../cors.php';
require __DIR__ . '/../db.php';
require __DIR__ . '/../auth_check.php';
require __DIR__ . '/listings_guard.php';
require __DIR__ . '/reports_utils.php';
require_workspace_permission('viewer');

header('Content-Type: application/json');

marketplace_assert_can_moderate_reports();

$statusFilter = isset($_GET['status']) ? strtolower(trim((string)$_GET['status'])) : 'open';
if ($statusFilter !== 'all') {
    $statusFilter = marketplace_validate_report_status($statusFilter);
}

$limit = max(1, min(200, (int)($_GET['limit'] ?? 100)));

try {
    marketplace_ensure_reports_table($pdo);

    $sql = '
        SELECT r.id, r.listing_id, r.reason, r.details, r.status, r.created_at, r.updated_at, r.resolved_at,
               r.reporter_user_id, r.listing_owner_user_id,
               l.title AS listing_title, l.status AS listing_status,
               reporter.username AS reporter_name,
               owner.username AS owner_name,
               resolver.username AS resolved_by_name
        FROM marketplace_listing_reports r
        INNER JOIN marketplace_listings l ON l.id = r.listing_id AND l.workspace_id = r.workspace_id
        LEFT JOIN users reporter ON reporter.id = r.reporter_user_id
        LEFT JOIN users owner ON owner.id = r.listing_owner_user_id
        LEFT JOIN users resolver ON resolver.id = r.resolved_by_user_id
        WHERE r.workspace_id = :workspace_id
    ';

    $params = [':workspace_id' => (int)$workspace_id];
    if ($statusFilter !== 'all') {
        $sql .= ' AND r.status = :status';
        $params[':status'] = $statusFilter;
    }

    $sql .= ' ORDER BY r.created_at DESC LIMIT ' . (int)$limit;

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
    if (!is_array($items)) {
        $items = [];
    }

    echo json_encode(['success' => true, 'items' => $items]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'DB error']);
}
