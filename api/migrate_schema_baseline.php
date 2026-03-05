<?php
declare(strict_types=1);

require __DIR__ . '/cors.php';
require __DIR__ . '/auth_check_admin.php';
require_once __DIR__ . '/env.php';
require_once __DIR__ . '/schema_utils.php';

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

/**
 * @param array<int, array<string, mixed>> $actions
 */
function schema_migration_add_action(array &$actions, string $type, string $table, string $detail, bool $executed): void
{
    $actions[] = [
        'type' => $type,
        'table' => $table,
        'detail' => $detail,
        'executed' => $executed,
    ];
}

/**
 * @param array<int, array<string, mixed>> $actions
 */
function schema_migration_add_warning(array &$actions, string $table, string $detail): void
{
    $actions[] = [
        'type' => 'warning',
        'table' => $table,
        'detail' => $detail,
        'executed' => false,
    ];
}

/**
 * @param array<int, array<string, mixed>> $actions
 */
function schema_migration_convert_table_collation(
    PDO $pdo,
    string $tableName,
    bool $dryRun,
    array &$actions
): void {
    if (!pv_schema_table_exists($pdo, $tableName)) {
        schema_migration_add_warning($actions, $tableName, 'Table not found, skipped collation conversion');
        return;
    }

    $currentCollation = pv_schema_table_collation($pdo, $tableName);
    if ($currentCollation !== null && strtolower($currentCollation) === 'utf8mb4_unicode_ci') {
        return;
    }

    $sql = sprintf(
        'ALTER TABLE `%s` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci',
        $tableName
    );
    if (!$dryRun) {
        $pdo->exec($sql);
    }

    schema_migration_add_action(
        $actions,
        'alter_table_collation',
        $tableName,
        sprintf('Set collation to utf8mb4_unicode_ci (was %s)', $currentCollation ?? 'unknown'),
        !$dryRun
    );
}

/**
 * @param array<int, array<string, mixed>> $actions
 */
function schema_migration_ensure_column(
    PDO $pdo,
    string $tableName,
    string $columnName,
    string $columnDefinition,
    bool $dryRun,
    array &$actions
): void {
    if (!pv_schema_table_exists($pdo, $tableName)) {
        schema_migration_add_warning($actions, $tableName, 'Table not found, skipped column check for ' . $columnName);
        return;
    }

    if (pv_schema_column_exists($pdo, $tableName, $columnName)) {
        return;
    }

    $sql = sprintf(
        'ALTER TABLE `%s` ADD COLUMN `%s` %s',
        $tableName,
        $columnName,
        $columnDefinition
    );
    if (!$dryRun) {
        $pdo->exec($sql);
    }

    schema_migration_add_action(
        $actions,
        'add_column',
        $tableName,
        sprintf('Added column `%s` (%s)', $columnName, $columnDefinition),
        !$dryRun
    );
}

/**
 * @param array<int, array<string, mixed>> $actions
 */
function schema_migration_ensure_index(
    PDO $pdo,
    string $tableName,
    string $indexName,
    string $indexColumnsSql,
    bool $dryRun,
    array &$actions
): void {
    if (!pv_schema_table_exists($pdo, $tableName)) {
        schema_migration_add_warning($actions, $tableName, 'Table not found, skipped index check for ' . $indexName);
        return;
    }

    if (pv_schema_index_exists($pdo, $tableName, $indexName)) {
        return;
    }

    $sql = sprintf(
        'CREATE INDEX `%s` ON `%s` %s',
        $indexName,
        $tableName,
        $indexColumnsSql
    );
    if (!$dryRun) {
        $pdo->exec($sql);
    }

    schema_migration_add_action(
        $actions,
        'add_index',
        $tableName,
        sprintf('Added index `%s` on %s', $indexName, $indexColumnsSql),
        !$dryRun
    );
}

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    $input = [];
}

$dryRun = !empty($input['dry_run']);
$actions = [];

try {
    $tablesToConvert = [
        'users',
        'workspaces',
        'workspace_members',
        'workspace_shares',
        'workspace_share_revocations',
        'collections',
        'personas',
        'persona_collections',
        'persona_revisions',
        'prompts',
        'prompt_revisions',
        'files',
        'user_sessions',
        'marketplace_listings',
        'marketplace_listing_events',
        'marketplace_listing_reports',
        'marketplace_orders',
        'marketplace_order_items',
        'marketplace_payments',
        'marketplace_reviews',
        'marketplace_download_events',
        'marketplace_favorites',
    ];

    foreach ($tablesToConvert as $tableName) {
        schema_migration_convert_table_collation($pdo, $tableName, $dryRun, $actions);
    }

    schema_migration_ensure_column($pdo, 'persona_revisions', 'user_id', 'INT(11) NULL', $dryRun, $actions);
    schema_migration_ensure_column($pdo, 'persona_revisions', 'workspace_id', 'INT(11) NULL', $dryRun, $actions);
    schema_migration_ensure_index($pdo, 'persona_revisions', 'idx_persona_revisions_persona_created', '(persona_id, created_at)', $dryRun, $actions);
    schema_migration_ensure_index($pdo, 'persona_revisions', 'idx_persona_revisions_workspace', '(workspace_id)', $dryRun, $actions);

    schema_migration_ensure_column($pdo, 'prompt_revisions', 'user_id', 'INT(11) NULL', $dryRun, $actions);
    schema_migration_ensure_column($pdo, 'prompt_revisions', 'workspace_id', 'INT(11) NULL', $dryRun, $actions);
    schema_migration_ensure_index($pdo, 'prompt_revisions', 'idx_prompt_revisions_prompt_created', '(prompt_id, created_at)', $dryRun, $actions);
    schema_migration_ensure_index($pdo, 'prompt_revisions', 'idx_prompt_revisions_workspace', '(workspace_id)', $dryRun, $actions);

    schema_migration_ensure_index($pdo, 'personas', 'idx_personas_workspace_user', '(workspace_id, user_id)', $dryRun, $actions);
    schema_migration_ensure_index($pdo, 'personas', 'idx_personas_workspace_updated', '(workspace_id, updated_at)', $dryRun, $actions);

    schema_migration_ensure_index($pdo, 'prompts', 'idx_prompts_workspace_user', '(workspace_id, user_id)', $dryRun, $actions);
    schema_migration_ensure_index($pdo, 'prompts', 'idx_prompts_workspace_updated', '(workspace_id, updated_at)', $dryRun, $actions);

    schema_migration_ensure_index($pdo, 'collections', 'idx_collections_workspace_user', '(workspace_id, user_id)', $dryRun, $actions);

    $appliedCount = 0;
    $warningsCount = 0;
    foreach ($actions as $action) {
        if (($action['type'] ?? '') === 'warning') {
            $warningsCount++;
        } elseif (!empty($action['executed'])) {
            $appliedCount++;
        }
    }

    echo json_encode([
        'success' => true,
        'mode' => $dryRun ? 'dry_run' : 'apply',
        'message' => $dryRun ? 'Schema baseline dry run completed' : 'Schema baseline migration completed',
        'summary' => [
            'actions_total' => count($actions),
            'actions_applied' => $appliedCount,
            'warnings' => $warningsCount,
        ],
        'actions' => $actions,
    ]);
} catch (Throwable $e) {
    error_log('Schema baseline migration failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error',
    ]);
}

