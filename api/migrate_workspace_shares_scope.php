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
           AND COLUMN_NAME = "share_scope"
         LIMIT 1'
    );
    $columnStmt->execute();
    $scopeColumnExists = (bool)$columnStmt->fetchColumn();

    $columnAdded = false;
    if (!$scopeColumnExists) {
        $pdo->exec(
            'ALTER TABLE workspace_shares
             ADD COLUMN share_scope VARCHAR(16) NOT NULL DEFAULT "read" AFTER token'
        );
        $columnAdded = true;
    }

    $sanitizeStmt = $pdo->prepare(
        'UPDATE workspace_shares
         SET share_scope = "read"
         WHERE share_scope IS NULL
            OR share_scope NOT IN ("read", "comment", "clone")'
    );
    $sanitizeStmt->execute();
    $rowsNormalized = $sanitizeStmt->rowCount();

    $indexStmt = $pdo->prepare(
        'SELECT 1
         FROM INFORMATION_SCHEMA.STATISTICS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = "workspace_shares"
           AND INDEX_NAME = "idx_workspace_shares_scope"
         LIMIT 1'
    );
    $indexStmt->execute();
    $scopeIndexExists = (bool)$indexStmt->fetchColumn();

    $indexAdded = false;
    if (!$scopeIndexExists) {
        $pdo->exec('CREATE INDEX idx_workspace_shares_scope ON workspace_shares (share_scope)');
        $indexAdded = true;
    }

    echo json_encode([
        'success' => true,
        'message' => 'Workspace share scope migration completed',
        'column_added' => $columnAdded,
        'rows_normalized' => $rowsNormalized,
        'index_added' => $indexAdded,
    ]);
} catch (PDOException $e) {
    error_log('Workspace share scope migration failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error',
    ]);
}

