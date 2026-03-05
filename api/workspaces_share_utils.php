<?php
declare(strict_types=1);

require_once __DIR__ . '/env.php';

if (!function_exists('workspace_share_ttl_hours')) {
    function workspace_share_ttl_hours(): int
    {
        $hours = (int)(pv_env('WORKSPACE_SHARE_TTL_HOURS', '168') ?? '168');
        if ($hours < 1) {
            return 1;
        }
        if ($hours > 24 * 30) {
            return 24 * 30;
        }
        return $hours;
    }
}

if (!function_exists('workspace_share_allowed_scopes')) {
    function workspace_share_allowed_scopes(): array
    {
        return ['read', 'comment', 'clone'];
    }
}

if (!function_exists('workspace_share_normalize_scope')) {
    function workspace_share_normalize_scope(?string $scope): string
    {
        $normalized = strtolower(trim((string)$scope));
        if (in_array($normalized, workspace_share_allowed_scopes(), true)) {
            return $normalized;
        }

        return 'read';
    }
}

if (!function_exists('workspace_share_supports_expires_at')) {
    function workspace_share_supports_expires_at(PDO $pdo): bool
    {
        static $cached = null;
        if ($cached !== null) {
            return $cached;
        }

        $stmt = $pdo->prepare(
            'SELECT 1
             FROM INFORMATION_SCHEMA.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = "workspace_shares"
               AND COLUMN_NAME = "expires_at"
             LIMIT 1'
        );
        $stmt->execute();
        $cached = (bool)$stmt->fetchColumn();
        return $cached;
    }
}

if (!function_exists('workspace_share_supports_scope')) {
    function workspace_share_supports_scope(PDO $pdo): bool
    {
        static $cached = null;
        if ($cached !== null) {
            return $cached;
        }

        $stmt = $pdo->prepare(
            'SELECT 1
             FROM INFORMATION_SCHEMA.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = "workspace_shares"
               AND COLUMN_NAME = "share_scope"
             LIMIT 1'
        );
        $stmt->execute();
        $cached = (bool)$stmt->fetchColumn();
        return $cached;
    }
}

if (!function_exists('workspace_share_insert')) {
    function workspace_share_insert(PDO $pdo, int $workspaceId, string $token, string $expiresAt, string $shareScope = 'read'): void
    {
        $scope = workspace_share_normalize_scope($shareScope);
        $hasExpiresAt = workspace_share_supports_expires_at($pdo);
        $hasScope = workspace_share_supports_scope($pdo);

        if ($hasExpiresAt && $hasScope) {
            $stmt = $pdo->prepare(
                'INSERT INTO workspace_shares (workspace_id, token, created_at, expires_at, share_scope)
                 VALUES (?, ?, NOW(), ?, ?)'
            );
            $stmt->execute([$workspaceId, $token, $expiresAt, $scope]);
            return;
        }

        if ($hasExpiresAt) {
            $stmt = $pdo->prepare(
                'INSERT INTO workspace_shares (workspace_id, token, created_at, expires_at)
                 VALUES (?, ?, NOW(), ?)'
            );
            $stmt->execute([$workspaceId, $token, $expiresAt]);
            return;
        }

        if ($hasScope) {
            $stmt = $pdo->prepare(
                'INSERT INTO workspace_shares (workspace_id, token, created_at, share_scope)
                 VALUES (?, ?, NOW(), ?)'
            );
            $stmt->execute([$workspaceId, $token, $scope]);
            return;
        }

        $stmt = $pdo->prepare(
            'INSERT INTO workspace_shares (workspace_id, token, created_at)
             VALUES (?, ?, NOW())'
        );
        $stmt->execute([$workspaceId, $token]);
    }
}

if (!function_exists('workspace_share_get_by_token')) {
    function workspace_share_get_by_token(PDO $pdo, string $token): ?array
    {
        $columns = ['workspace_id', 'token', 'created_at'];
        if (workspace_share_supports_expires_at($pdo)) {
            $columns[] = 'expires_at';
        }
        if (workspace_share_supports_scope($pdo)) {
            $columns[] = 'share_scope';
        }

        $stmt = $pdo->prepare(
            'SELECT ' . implode(', ', $columns) . '
             FROM workspace_shares
             WHERE token = ?
             LIMIT 1'
        );
        $stmt->execute([$token]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }
}

if (!function_exists('workspace_share_expires_at')) {
    function workspace_share_expires_at(array $share): DateTimeImmutable
    {
        $utc = new DateTimeZone('UTC');
        if (!empty($share['expires_at'])) {
            return new DateTimeImmutable((string)$share['expires_at'], $utc);
        }

        $createdAt = !empty($share['created_at'])
            ? new DateTimeImmutable((string)$share['created_at'], $utc)
            : new DateTimeImmutable('now', $utc);

        return $createdAt->modify('+' . workspace_share_ttl_hours() . ' hours');
    }
}

if (!function_exists('workspace_share_scope')) {
    function workspace_share_scope(array $share): string
    {
        return workspace_share_normalize_scope((string)($share['share_scope'] ?? 'read'));
    }
}

if (!function_exists('workspace_share_permissions')) {
    function workspace_share_permissions(string $shareScope): array
    {
        $scope = workspace_share_normalize_scope($shareScope);
        return [
            'can_read' => true,
            'can_comment' => in_array($scope, ['comment', 'clone'], true),
            'can_clone' => $scope === 'clone',
        ];
    }
}

if (!function_exists('workspace_share_is_expired')) {
    function workspace_share_is_expired(array $share): bool
    {
        $expiresAt = workspace_share_expires_at($share);
        $now = new DateTimeImmutable('now', new DateTimeZone('UTC'));
        return $expiresAt <= $now;
    }
}

if (!function_exists('workspace_share_ensure_revocation_table')) {
    function workspace_share_ensure_revocation_table(PDO $pdo): void
    {
        $pdo->exec(
            'CREATE TABLE IF NOT EXISTS workspace_share_revocations (
                token VARCHAR(128) PRIMARY KEY,
                workspace_id INT NOT NULL,
                revoked_by_user_id INT NOT NULL,
                revoked_at DATETIME NOT NULL,
                INDEX idx_workspace_id (workspace_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'
        );
    }
}

if (!function_exists('workspace_share_is_revoked')) {
    function workspace_share_is_revoked(PDO $pdo, string $token): bool
    {
        $tableStmt = $pdo->prepare(
            'SELECT 1
             FROM INFORMATION_SCHEMA.TABLES
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = "workspace_share_revocations"
             LIMIT 1'
        );
        $tableStmt->execute();
        if (!$tableStmt->fetchColumn()) {
            return false;
        }

        $stmt = $pdo->prepare('SELECT 1 FROM workspace_share_revocations WHERE token = ? LIMIT 1');
        $stmt->execute([$token]);
        return (bool)$stmt->fetchColumn();
    }
}
