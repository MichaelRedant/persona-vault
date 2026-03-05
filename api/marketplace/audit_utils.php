<?php
declare(strict_types=1);

require_once __DIR__ . '/listings_guard.php';

if (!function_exists('marketplace_ensure_listing_events_table')) {
    function marketplace_ensure_listing_events_table(PDO $pdo): void
    {
        $pdo->exec(
            'CREATE TABLE IF NOT EXISTS marketplace_listing_events (
                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                listing_id BIGINT UNSIGNED NOT NULL,
                workspace_id BIGINT UNSIGNED NOT NULL,
                actor_user_id BIGINT UNSIGNED NULL,
                event_type VARCHAR(40) NOT NULL,
                payload_json LONGTEXT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_marketplace_listing_events_listing_created (listing_id, created_at),
                INDEX idx_marketplace_listing_events_workspace_created (workspace_id, created_at),
                INDEX idx_marketplace_listing_events_type (event_type)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
        );
    }
}

if (!function_exists('marketplace_validate_event_type')) {
    function marketplace_validate_event_type(string $value): string
    {
        $eventType = strtolower(trim($value));
        if ($eventType === '' || !preg_match('/^[a-z0-9_]{3,40}$/', $eventType)) {
            marketplace_fail(422, 'Invalid marketplace event type');
        }

        return $eventType;
    }
}

if (!function_exists('marketplace_encode_event_payload')) {
    /**
     * @param array<string, mixed> $payload
     */
    function marketplace_encode_event_payload(array $payload): string
    {
        if ($payload === []) {
            return '{}';
        }

        $encoded = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        if (!is_string($encoded)) {
            return '{}';
        }

        return $encoded;
    }
}

if (!function_exists('marketplace_log_listing_event')) {
    /**
     * @param array<string, mixed> $payload
     */
    function marketplace_log_listing_event(
        PDO $pdo,
        int $listingId,
        int $workspaceId,
        ?int $actorUserId,
        string $eventType,
        array $payload = []
    ): void {
        if ($listingId <= 0 || $workspaceId <= 0) {
            marketplace_fail(422, 'Invalid listing/workspace id for marketplace event');
        }

        marketplace_ensure_listing_events_table($pdo);

        $stmt = $pdo->prepare(
            'INSERT INTO marketplace_listing_events
            (listing_id, workspace_id, actor_user_id, event_type, payload_json)
            VALUES (?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $listingId,
            $workspaceId,
            $actorUserId !== null ? (int)$actorUserId : null,
            marketplace_validate_event_type($eventType),
            marketplace_encode_event_payload($payload),
        ]);
    }
}

