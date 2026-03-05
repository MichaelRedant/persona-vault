<?php
declare(strict_types=1);

if (!function_exists('marketplace_ensure_reports_table')) {
    function marketplace_ensure_reports_table(PDO $pdo): void
    {
        $sql = "
            CREATE TABLE IF NOT EXISTS marketplace_listing_reports (
                id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                listing_id BIGINT UNSIGNED NOT NULL,
                workspace_id BIGINT UNSIGNED NOT NULL,
                reporter_user_id BIGINT UNSIGNED NOT NULL,
                listing_owner_user_id BIGINT UNSIGNED NOT NULL,
                reason VARCHAR(40) NOT NULL,
                details TEXT NULL,
                status VARCHAR(20) NOT NULL DEFAULT 'open',
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                resolved_at TIMESTAMP NULL DEFAULT NULL,
                resolved_by_user_id BIGINT UNSIGNED NULL,
                INDEX idx_marketplace_reports_listing (listing_id),
                INDEX idx_marketplace_reports_workspace_status (workspace_id, status),
                INDEX idx_marketplace_reports_reporter (reporter_user_id),
                INDEX idx_marketplace_reports_created (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ";

        $pdo->exec($sql);
    }
}

if (!function_exists('marketplace_can_moderate_reports')) {
    function marketplace_can_moderate_reports(): bool
    {
        global $is_admin, $workspace_role;

        if (!empty($is_admin)) {
            return true;
        }

        return strtolower(trim((string)($workspace_role ?? ''))) === 'admin';
    }
}

if (!function_exists('marketplace_assert_can_moderate_reports')) {
    function marketplace_assert_can_moderate_reports(): void
    {
        if (!marketplace_can_moderate_reports()) {
            marketplace_fail(403, 'Insufficient permissions for moderation');
        }
    }
}

if (!function_exists('marketplace_validate_report_reason')) {
    function marketplace_validate_report_reason($value): string
    {
        $reason = strtolower(trim((string)$value));
        $allowed = ['spam', 'copyright', 'abuse', 'malware', 'other'];

        if (!in_array($reason, $allowed, true)) {
            marketplace_fail(422, 'Invalid report reason');
        }

        return $reason;
    }
}

if (!function_exists('marketplace_validate_report_details')) {
    function marketplace_validate_report_details($value): string
    {
        $details = trim((string)$value);
        if (marketplace_strlen($details) > 1000) {
            marketplace_fail(422, 'Report details too long');
        }

        return $details;
    }
}

if (!function_exists('marketplace_validate_report_status')) {
    function marketplace_validate_report_status($value): string
    {
        $status = strtolower(trim((string)$value));
        $allowed = ['open', 'reviewed', 'resolved', 'dismissed'];

        if (!in_array($status, $allowed, true)) {
            marketplace_fail(422, 'Invalid report status');
        }

        return $status;
    }
}
