<?php
declare(strict_types=1);

if (!function_exists('pv_get_table_columns')) {
    /**
     * @return array<int, string>
     */
    function pv_get_table_columns(PDO $pdo, string $tableName): array
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
        foreach ($rows as $columnName) {
            if (!is_string($columnName) || $columnName === '') {
                continue;
            }

            $columns[] = strtolower($columnName);
        }

        return array_values(array_unique($columns));
    }
}

if (!function_exists('pv_build_compatible_insert')) {
    /**
     * @param array<string, mixed> $columnValues
     * @return array{sql: string, params: array<int, mixed>, used_columns: array<int, string>}
     */
    function pv_build_compatible_insert(PDO $pdo, string $tableName, array $columnValues): array
    {
        $availableColumns = pv_get_table_columns($pdo, $tableName);

        $insertColumns = [];
        $placeholders = [];
        $params = [];

        foreach ($columnValues as $column => $value) {
            $normalizedColumn = strtolower(trim((string)$column));
            if ($normalizedColumn === '' || !in_array($normalizedColumn, $availableColumns, true)) {
                continue;
            }

            $insertColumns[] = $normalizedColumn;
            $placeholders[] = '?';
            $params[] = $value;
        }

        if (in_array('created_at', $availableColumns, true)) {
            $insertColumns[] = 'created_at';
            $placeholders[] = 'NOW()';
        }

        if ($insertColumns === []) {
            throw new RuntimeException('No compatible insert columns found for ' . $tableName);
        }

        $sql = 'INSERT INTO ' . $tableName
            . ' (' . implode(', ', $insertColumns) . ')'
            . ' VALUES (' . implode(', ', $placeholders) . ')';

        return [
            'sql' => $sql,
            'params' => $params,
            'used_columns' => $insertColumns,
        ];
    }
}

if (!function_exists('pv_select_column_or_null')) {
    /**
     * @param array<int, string> $availableColumns
     */
    function pv_select_column_or_null(array $availableColumns, string $column, string $alias): string
    {
        $normalizedColumn = strtolower(trim($column));
        if (in_array($normalizedColumn, $availableColumns, true)) {
            return $normalizedColumn . ' AS ' . $alias;
        }

        return 'NULL AS ' . $alias;
    }
}

