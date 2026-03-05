<?php
declare(strict_types=1);

require __DIR__ . '/cors.php';
require __DIR__ . '/auth_check_admin.php';
require_once __DIR__ . '/env.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$allowMaintenance = pv_env('ALLOW_MAINTENANCE', '0');
if ($allowMaintenance !== '1') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Maintenance endpoint disabled']);
    exit;
}

function migration_share_ttl_hours(): int
{
    $raw = pv_env('WORKSPACE_SHARE_TTL_HOURS', '168');
    $hours = (int)($raw ?? '168');

    if ($hours < 1) {
        return 1;
    }

    if ($hours > 24 * 30) {
        return 24 * 30;
    }

    return $hours;
}

try {
    $tableStmt = $pdo->prepare(
        'SELECT 1
         FROM INFORMATION_SCHEMA.TABLES
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = "workspace_shares"
         LIMIT 1'
    );
    $tableStmt->execute();
    $tableExists = (bool)$tableStmt->fetchColumn();

    if (!$tableExists) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Table workspace_shares not found',
        ]);
        exit;
    }

    $columnStmt = $pdo->prepare(
        'SELECT 1
         FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = "workspace_shares"
           AND COLUMN_NAME = "expires_at"
         LIMIT 1'
    );
    $columnStmt->execute();
    $expiresColumnExists = (bool)$columnStmt->fetchColumn();

    $columnAdded = false;
    if (!$expiresColumnExists) {
        $pdo->exec('ALTER TABLE workspace_shares ADD COLUMN expires_at DATETIME NULL AFTER created_at');
        $columnAdded = true;
    }

    $ttlHours = migration_share_ttl_hours();
    $backfillStmt = $pdo->prepare(
        'UPDATE workspace_shares
         SET expires_at = DATE_ADD(COALESCE(created_at, UTC_TIMESTAMP()), INTERVAL :ttl HOUR)
         WHERE expires_at IS NULL'
    );
    $backfillStmt->bindValue(':ttl', $ttlHours, PDO::PARAM_INT);
    $backfillStmt->execute();
    $rowsBackfilled = $backfillStmt->rowCount();

    $indexStmt = $pdo->prepare(
        'SELECT 1
         FROM INFORMATION_SCHEMA.STATISTICS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = "workspace_shares"
           AND INDEX_NAME = "idx_workspace_shares_expires_at"
         LIMIT 1'
    );
    $indexStmt->execute();
    $expiresIndexExists = (bool)$indexStmt->fetchColumn();

    $indexAdded = false;
    if (!$expiresIndexExists) {
        $pdo->exec('CREATE INDEX idx_workspace_shares_expires_at ON workspace_shares (expires_at)');
        $indexAdded = true;
    }

    echo json_encode([
        'success' => true,
        'message' => 'Workspace share expiry migration completed',
        'column_added' => $columnAdded,
        'rows_backfilled' => $rowsBackfilled,
        'index_added' => $indexAdded,
        'ttl_hours_used' => $ttlHours,
    ]);
} catch (PDOException $e) {
    error_log('Workspace share expiry migration failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error',
    ]);
}
