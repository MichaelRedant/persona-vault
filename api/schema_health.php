<?php
declare(strict_types=1);

require __DIR__ . '/cors.php';
require __DIR__ . '/auth_check_admin.php';
require_once __DIR__ . '/schema_utils.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

/**
 * @param array<int, array<string, string>> $issues
 */
function schema_health_add_issue(array &$issues, string $severity, string $table, string $message): void
{
    $issues[] = [
        'severity' => $severity,
        'table' => $table,
        'message' => $message,
    ];
}

try {
    $spec = [
        'personas' => [
            'columns' => ['id', 'user_id', 'workspace_id', 'name', 'description', 'favorite', 'tags', 'created_at', 'updated_at'],
            'indexes' => ['primary', 'idx_personas_workspace_user', 'idx_personas_workspace_updated'],
            'preferred_collation' => 'utf8mb4_unicode_ci',
        ],
        'prompts' => [
            'columns' => ['id', 'user_id', 'workspace_id', 'title', 'content', 'favorite', 'tags', 'created_at', 'updated_at'],
            'indexes' => ['primary', 'idx_prompts_workspace_user', 'idx_prompts_workspace_updated'],
            'preferred_collation' => 'utf8mb4_unicode_ci',
        ],
        'collections' => [
            'columns' => ['id', 'user_id', 'workspace_id', 'name', 'created_at', 'updated_at'],
            'indexes' => ['primary', 'idx_collections_workspace_user'],
            'preferred_collation' => 'utf8mb4_unicode_ci',
        ],
        'persona_revisions' => [
            'columns' => ['id', 'persona_id', 'user_id', 'workspace_id', 'name', 'description', 'tags', 'collection_ids', 'created_at'],
            'indexes' => ['primary', 'idx_persona_revisions_persona_created', 'idx_persona_revisions_workspace'],
            'preferred_collation' => 'utf8mb4_unicode_ci',
        ],
        'prompt_revisions' => [
            'columns' => ['id', 'prompt_id', 'user_id', 'workspace_id', 'title', 'content', 'category', 'tags', 'created_at'],
            'indexes' => ['primary', 'idx_prompt_revisions_prompt_created', 'idx_prompt_revisions_workspace'],
            'preferred_collation' => 'utf8mb4_unicode_ci',
        ],
    ];

    $issues = [];
    $tablesChecked = 0;

    foreach ($spec as $tableName => $requirements) {
        $tablesChecked++;

        if (!pv_schema_table_exists($pdo, $tableName)) {
            schema_health_add_issue($issues, 'error', $tableName, 'Missing table');
            continue;
        }

        $existingColumns = pv_schema_table_columns($pdo, $tableName);
        foreach ($requirements['columns'] as $requiredColumn) {
            if (!in_array(strtolower($requiredColumn), $existingColumns, true)) {
                schema_health_add_issue($issues, 'error', $tableName, 'Missing column `' . $requiredColumn . '`');
            }
        }

        $existingIndexes = pv_schema_table_indexes($pdo, $tableName);
        foreach ($requirements['indexes'] as $requiredIndex) {
            if (!in_array(strtolower($requiredIndex), $existingIndexes, true)) {
                schema_health_add_issue($issues, 'warning', $tableName, 'Missing index `' . $requiredIndex . '`');
            }
        }

        $preferredCollation = strtolower((string)($requirements['preferred_collation'] ?? ''));
        if ($preferredCollation !== '') {
            $currentCollation = strtolower((string)(pv_schema_table_collation($pdo, $tableName) ?? ''));
            if ($currentCollation !== '' && $currentCollation !== $preferredCollation) {
                schema_health_add_issue(
                    $issues,
                    'warning',
                    $tableName,
                    'Collation drift: current `' . $currentCollation . '`, expected `' . $preferredCollation . '`'
                );
            }
        }
    }

    $errorCount = 0;
    $warningCount = 0;
    foreach ($issues as $issue) {
        if (($issue['severity'] ?? '') === 'error') {
            $errorCount++;
        } else {
            $warningCount++;
        }
    }

    echo json_encode([
        'success' => $errorCount === 0,
        'status' => $errorCount === 0 ? 'healthy_or_warn' : 'schema_drift',
        'summary' => [
            'tables_checked' => $tablesChecked,
            'errors' => $errorCount,
            'warnings' => $warningCount,
        ],
        'issues' => $issues,
    ]);
} catch (Throwable $e) {
    error_log('Schema health check failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error',
    ]);
}

