<?php
declare(strict_types=1);

if (!function_exists('marketplace_fail')) {
    function marketplace_fail(int $statusCode, string $message): void
    {
        http_response_code($statusCode);
        echo json_encode(['success' => false, 'error' => $message]);
        exit;
    }
}

if (!function_exists('marketplace_strlen')) {
    function marketplace_strlen(string $value): int
    {
        if (function_exists('mb_strlen')) {
            return (int)mb_strlen($value);
        }

        return strlen($value);
    }
}

if (!function_exists('marketplace_item_owner_query')) {
    function marketplace_item_owner_query(string $itemType): ?string
    {
        switch ($itemType) {
            case 'persona':
                return 'SELECT user_id FROM personas WHERE id = ? AND workspace_id = ? LIMIT 1';
            case 'prompt':
                return 'SELECT user_id FROM prompts WHERE id = ? AND workspace_id = ? LIMIT 1';
            case 'bundle':
                return 'SELECT user_id FROM collections WHERE id = ? AND workspace_id = ? LIMIT 1';
            case 'asset':
                return 'SELECT uploader_user_id FROM files WHERE id = ? AND workspace_id = ? LIMIT 1';
            default:
                return null;
        }
    }
}

if (!function_exists('marketplace_assert_source_item_owned')) {
    function marketplace_assert_source_item_owned(
        PDO $pdo,
        string $itemType,
        int $itemId,
        int $workspaceId,
        int $userId,
        bool $isAdmin
    ): int {
        $ownerQuery = marketplace_item_owner_query($itemType);
        if ($ownerQuery === null) {
            marketplace_fail(422, 'Invalid item_type');
        }

        $ownerStmt = $pdo->prepare($ownerQuery);
        $ownerStmt->execute([$itemId, $workspaceId]);
        $itemOwnerId = $ownerStmt->fetchColumn();

        if ($itemOwnerId === false) {
            marketplace_fail(404, 'Source item not found');
        }

        $itemOwnerId = (int)$itemOwnerId;
        if ($itemOwnerId !== $userId && !$isAdmin) {
            marketplace_fail(403, 'Not allowed to list this item');
        }

        return $itemOwnerId;
    }
}

if (!function_exists('marketplace_normalize_cover_file_id')) {
    function marketplace_normalize_cover_file_id($value): ?int
    {
        if ($value === null || $value === '') {
            return null;
        }

        if (!is_numeric($value)) {
            marketplace_fail(422, 'Invalid cover_file_id');
        }

        $coverFileId = (int)$value;
        if ($coverFileId <= 0) {
            marketplace_fail(422, 'Invalid cover_file_id');
        }

        return $coverFileId;
    }
}

if (!function_exists('marketplace_assert_cover_file_owned')) {
    function marketplace_assert_cover_file_owned(
        PDO $pdo,
        ?int $coverFileId,
        int $workspaceId,
        int $userId,
        bool $isAdmin
    ): void {
        if ($coverFileId === null) {
            return;
        }

        $coverStmt = $pdo->prepare(
            'SELECT uploader_user_id FROM files WHERE id = ? AND workspace_id = ? LIMIT 1'
        );
        $coverStmt->execute([$coverFileId, $workspaceId]);
        $coverOwnerId = $coverStmt->fetchColumn();

        if ($coverOwnerId === false) {
            marketplace_fail(422, 'Invalid cover_file_id');
        }

        if ((int)$coverOwnerId !== $userId && !$isAdmin) {
            marketplace_fail(403, 'Not allowed to use this cover file');
        }
    }
}

if (!function_exists('marketplace_validate_visibility')) {
    function marketplace_validate_visibility($value): string
    {
        $visibility = strtolower(trim((string)$value));
        if (!in_array($visibility, ['public', 'unlisted', 'private'], true)) {
            marketplace_fail(422, 'Invalid visibility');
        }

        return $visibility;
    }
}

if (!function_exists('marketplace_validate_status')) {
    function marketplace_validate_status($value): string
    {
        $status = strtolower(trim((string)$value));
        $allowed = ['active', 'paused', 'flagged', 'removed'];
        if (!in_array($status, $allowed, true)) {
            marketplace_fail(422, 'Invalid status');
        }

        return $status;
    }
}

if (!function_exists('marketplace_validate_currency')) {
    function marketplace_validate_currency($value): string
    {
        $currency = strtoupper(trim((string)$value));
        if (!preg_match('/^[A-Z]{3}$/', $currency)) {
            marketplace_fail(422, 'Invalid currency');
        }

        return $currency;
    }
}

if (!function_exists('marketplace_validate_price_cents')) {
    function marketplace_validate_price_cents($value): int
    {
        if (!is_numeric($value)) {
            marketplace_fail(422, 'Invalid price_cents');
        }

        $priceCents = (int)$value;
        if ($priceCents < 0) {
            marketplace_fail(422, 'price_cents must be zero or positive');
        }

        return $priceCents;
    }
}

if (!function_exists('marketplace_validate_title')) {
    function marketplace_validate_title($value): string
    {
        $title = trim((string)$value);
        if ($title === '') {
            marketplace_fail(422, 'Title is required');
        }

        if (marketplace_strlen($title) > 255) {
            marketplace_fail(422, 'Title too long');
        }

        return $title;
    }
}

if (!function_exists('marketplace_validate_description')) {
    function marketplace_validate_description($value): string
    {
        $description = trim((string)$value);
        if (marketplace_strlen($description) > 5000) {
            marketplace_fail(422, 'Description too long');
        }

        return $description;
    }
}

if (!function_exists('marketplace_validate_tags')) {
    function marketplace_validate_tags($value): string
    {
        $tags = trim((string)$value);
        if (marketplace_strlen($tags) > 500) {
            marketplace_fail(422, 'Tags too long');
        }

        return $tags;
    }
}

if (!function_exists('marketplace_get_listing_for_workspace')) {
    /**
     * @return array<string, mixed>|null
     */
    function marketplace_get_listing_for_workspace(PDO $pdo, int $listingId, int $workspaceId): ?array
    {
        $stmt = $pdo->prepare(
            'SELECT id, seller_user_id, workspace_id, item_type, item_id, status, visibility, title
             FROM marketplace_listings
             WHERE id = ? AND workspace_id = ?
             LIMIT 1'
        );
        $stmt->execute([$listingId, $workspaceId]);

        $listing = $stmt->fetch(PDO::FETCH_ASSOC);
        return is_array($listing) ? $listing : null;
    }
}

if (!function_exists('marketplace_assert_listing_owner')) {
    /**
     * @param array<string, mixed>|null $listing
     */
    function marketplace_assert_listing_owner($listing, int $userId, bool $isAdmin): void
    {
        if (!is_array($listing)) {
            marketplace_fail(404, 'Listing not found');
        }

        if ((int)$listing['seller_user_id'] !== $userId && !$isAdmin) {
            marketplace_fail(403, 'Not allowed');
        }
    }
}

if (!function_exists('marketplace_assert_listing_source_integrity')) {
    /**
     * @param array<string, mixed> $listing
     */
    function marketplace_assert_listing_source_integrity(PDO $pdo, array $listing, int $workspaceId): void
    {
        $itemType = strtolower(trim((string)($listing['item_type'] ?? '')));
        $itemId = (int)($listing['item_id'] ?? 0);

        if ($itemType === '' || $itemId <= 0) {
            marketplace_fail(409, 'Listing source metadata is invalid');
        }

        $ownerQuery = marketplace_item_owner_query($itemType);
        if ($ownerQuery === null) {
            marketplace_fail(409, 'Listing source type is invalid');
        }

        $sourceStmt = $pdo->prepare($ownerQuery);
        $sourceStmt->execute([$itemId, $workspaceId]);
        if ($sourceStmt->fetchColumn() === false) {
            marketplace_fail(409, 'Listing source item no longer exists');
        }
    }
}
