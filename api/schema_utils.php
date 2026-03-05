<?php
declare(strict_types=1);

if (!function_exists('pv_schema_table_exists')) {
    function pv_schema_table_exists(PDO $pdo, string $tableName): bool
    {
        $stmt = $pdo->prepare(
            'SELECT 1
             FROM INFORMATION_SCHEMA.TABLES
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = ?
             LIMIT 1'
        );
        $stmt->execute([$tableName]);
        return (bool)$stmt->fetchColumn();
    }
}

if (!function_exists('pv_schema_column_exists')) {
    function pv_schema_column_exists(PDO $pdo, string $tableName, string $columnName): bool
    {
        $stmt = $pdo->prepare(
            'SELECT 1
             FROM INFORMATION_SCHEMA.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = ?
               AND COLUMN_NAME = ?
             LIMIT 1'
        );
        $stmt->execute([$tableName, $columnName]);
        return (bool)$stmt->fetchColumn();
    }
}

if (!function_exists('pv_schema_index_exists')) {
    function pv_schema_index_exists(PDO $pdo, string $tableName, string $indexName): bool
    {
        $stmt = $pdo->prepare(
            'SELECT 1
             FROM INFORMATION_SCHEMA.STATISTICS
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = ?
               AND INDEX_NAME = ?
             LIMIT 1'
        );
        $stmt->execute([$tableName, $indexName]);
        return (bool)$stmt->fetchColumn();
    }
}

if (!function_exists('pv_schema_table_collation')) {
    function pv_schema_table_collation(PDO $pdo, string $tableName): ?string
    {
        $stmt = $pdo->prepare(
            'SELECT TABLE_COLLATION
             FROM INFORMATION_SCHEMA.TABLES
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = ?
             LIMIT 1'
        );
        $stmt->execute([$tableName]);
        $value = $stmt->fetchColumn();
        return is_string($value) ? $value : null;
    }
}

if (!function_exists('pv_schema_table_columns')) {
    /**
     * @return array<int, string>
     */
    function pv_schema_table_columns(PDO $pdo, string $tableName): array
    {
        $stmt = $pdo->prepare(
            'SELECT COLUMN_NAME
             FROM INFORMATION_SCHEMA.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = ?'
        );
        $stmt->execute([$tableName]);
        $rows = $stmt->fetchAll(PDO::FETCH_COLUMN);
        if (!is_array($rows)) {
            return [];
        }

        $columns = [];
        foreach ($rows as $row) {
            if (!is_string($row) || $row === '') {
                continue;
            }
            $columns[] = strtolower($row);
        }

        return array_values(array_unique($columns));
    }
}

if (!function_exists('pv_schema_table_indexes')) {
    /**
     * @return array<int, string>
     */
    function pv_schema_table_indexes(PDO $pdo, string $tableName): array
    {
        $stmt = $pdo->prepare(
            'SELECT DISTINCT INDEX_NAME
             FROM INFORMATION_SCHEMA.STATISTICS
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = ?'
        );
        $stmt->execute([$tableName]);
        $rows = $stmt->fetchAll(PDO::FETCH_COLUMN);
        if (!is_array($rows)) {
            return [];
        }

        $indexes = [];
        foreach ($rows as $row) {
            if (!is_string($row) || $row === '') {
                continue;
            }
            $indexes[] = strtolower($row);
        }

        return array_values(array_unique($indexes));
    }
}

