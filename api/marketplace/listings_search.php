<?php
declare(strict_types=1);

require __DIR__ . '/../cors.php';
require __DIR__ . '/../db.php';
require __DIR__ . '/listings_guard.php';
require_once __DIR__ . '/../jwt_utils.php';

header('Content-Type: application/json');

$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$tokenParam = $_GET['token'] ?? '';

$isAdmin = false;
$userId = null;
$tokenWorkspaceId = null;

$jwt = null;
if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    $jwt = $matches[1];
} elseif ($tokenParam !== '') {
    $jwt = $tokenParam;
}

if ($jwt) {
    $decoded = validate_jwt($jwt);
    if (is_array($decoded)) {
        $isAdmin = !empty($decoded['is_admin']);
        $userId = isset($decoded['user_id']) ? (int)$decoded['user_id'] : null;
        $tokenWorkspaceId = isset($decoded['workspace_id']) ? (int)$decoded['workspace_id'] : null;
    }
}

$q = isset($_GET['q']) ? trim((string)$_GET['q']) : '';
$kind = isset($_GET['kind']) ? strtolower(trim((string)$_GET['kind'])) : '';
$tag = isset($_GET['tag']) ? trim((string)$_GET['tag']) : '';
$seller = isset($_GET['seller']) ? trim((string)$_GET['seller']) : '';
$limit = max(1, min(60, (int)($_GET['limit'] ?? 24)));
$page = max(1, (int)($_GET['page'] ?? 1));
$offset = ($page - 1) * $limit;
$sort = strtolower(trim((string)($_GET['sort'] ?? 'recent')));
$statusFilter = isset($_GET['status']) ? strtolower(trim((string)$_GET['status'])) : 'all';
$visibilityFilter = isset($_GET['visibility']) ? strtolower(trim((string)$_GET['visibility'])) : 'all';

$allowedKinds = ['persona', 'prompt', 'bundle', 'asset'];
if ($kind !== '' && !in_array($kind, $allowedKinds, true)) {
    marketplace_fail(422, 'Invalid kind filter');
}

$allowedSorts = ['recent', 'popular', 'favorites', 'price_asc', 'price_desc', 'relevance'];
if (!in_array($sort, $allowedSorts, true)) {
    marketplace_fail(422, 'Invalid sort option');
}

if (!$isAdmin) {
    $statusFilter = 'active';
    $visibilityFilter = 'public';
} else {
    if ($statusFilter !== 'all') {
        $statusFilter = marketplace_validate_status($statusFilter);
    }

    if ($visibilityFilter !== 'all') {
        $visibilityFilter = marketplace_validate_visibility($visibilityFilter);
    }
}

$wheres = [];
$params = [];

if ($statusFilter !== 'all') {
    $wheres[] = 'l.status = ?';
    $params[] = $statusFilter;
}

if ($visibilityFilter !== 'all') {
    $wheres[] = 'l.visibility = ?';
    $params[] = $visibilityFilter;
}

if ($kind !== '') {
    $wheres[] = 'l.item_type = ?';
    $params[] = $kind;
}

if ($tag !== '') {
    $wheres[] = "(FIND_IN_SET(?, REPLACE(REPLACE(l.tags, ' ', ''), ';', ',')) > 0 OR l.tags LIKE ?)";
    $params[] = $tag;
    $params[] = '%' . $tag . '%';
}

if ($seller !== '') {
    $wheres[] = 'u.username LIKE ?';
    $params[] = '%' . $seller . '%';
}

$orderSql = 'l.created_at DESC';
if ($sort === 'popular') {
    $orderSql = 'downloads_count DESC, favorites_count DESC, l.created_at DESC';
} elseif ($sort === 'favorites') {
    $orderSql = 'favorites_count DESC, l.created_at DESC';
} elseif ($sort === 'price_asc') {
    $orderSql = 'l.price_cents ASC, l.created_at DESC';
} elseif ($sort === 'price_desc') {
    $orderSql = 'l.price_cents DESC, l.created_at DESC';
}

$whereSql = count($wheres) > 0 ? ('WHERE ' . implode(' AND ', $wheres)) : '';

$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? 'localhost';
$scriptPath = str_replace('\\', '/', $_SERVER['SCRIPT_NAME'] ?? '/');
$apiDir = dirname(dirname($scriptPath));
$vaultBase = dirname($apiDir);
$configuredBase = rtrim((string)getenv('PUBLIC_BASE_URL'), '/');
$publicBase = $configuredBase !== '' ? $configuredBase : ($scheme . '://' . $host . $vaultBase);

try {
    $fulltextAvailable = false;
    $downloadEventsTableExists = false;
    $favoritesTableExists = false;

    try {
        $ftStmt = $pdo->prepare(
            'SELECT COUNT(*)
             FROM INFORMATION_SCHEMA.STATISTICS
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = "marketplace_listings"
               AND INDEX_TYPE = "FULLTEXT"'
        );
        $ftStmt->execute();
        $fulltextAvailable = (bool)$ftStmt->fetchColumn();
    } catch (Throwable $e) {
        $fulltextAvailable = false;
    }

    try {
        $tableStmt = $pdo->prepare(
            'SELECT TABLE_NAME
             FROM INFORMATION_SCHEMA.TABLES
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME IN ("marketplace_download_events", "marketplace_favorites")'
        );
        $tableStmt->execute();
        $tableRows = $tableStmt->fetchAll(PDO::FETCH_COLUMN);
        $tableRows = is_array($tableRows) ? $tableRows : [];

        $downloadEventsTableExists = in_array('marketplace_download_events', $tableRows, true);
        $favoritesTableExists = in_array('marketplace_favorites', $tableRows, true);
    } catch (Throwable $e) {
        $downloadEventsTableExists = false;
        $favoritesTableExists = false;
    }

    $downloadsExpr = $downloadEventsTableExists
        ? '(SELECT COUNT(*) FROM marketplace_download_events d WHERE d.listing_id = l.id)'
        : '0';
    $favoritesExpr = $favoritesTableExists
        ? '(SELECT COUNT(*) FROM marketplace_favorites fav WHERE fav.listing_id = l.id)'
        : '0';

    $baseSelect = '
        SELECT l.id,
               l.title,
               l.description,
               l.price_cents,
               l.currency,
               l.item_type,
               l.workspace_id,
               l.seller_user_id,
               l.status,
               l.visibility,
               l.tags,
               l.published_at,
               l.cover_file_id,
               u.username AS seller_name,
               u.is_admin AS seller_is_admin,
               f.storage_path,
               ' . $downloadsExpr . ' AS downloads_count,
               ' . $favoritesExpr . ' AS favorites_count
        FROM marketplace_listings l
        LEFT JOIN users u ON u.id = l.seller_user_id
        LEFT JOIN files f ON f.id = l.cover_file_id
    ';

    $queryParams = $params;
    $sql = '';

    if ($q !== '') {
        $like = '%' . $q . '%';

        if ($fulltextAvailable) {
            $sql = $baseSelect . ' ' . $whereSql
                . ($whereSql !== '' ? ' AND ' : ' WHERE ')
                . '((MATCH(l.title, l.description, l.tags) AGAINST (? IN NATURAL LANGUAGE MODE)) OR (l.title LIKE ? OR l.description LIKE ? OR l.tags LIKE ?))';
            $queryParams = array_merge($queryParams, [$q, $like, $like, $like]);

            if ($sort === 'relevance') {
                $sql .= ' ORDER BY MATCH(l.title, l.description, l.tags) AGAINST (? IN NATURAL LANGUAGE MODE) DESC, l.created_at DESC';
                $queryParams[] = $q;
            } else {
                $sql .= ' ORDER BY ' . $orderSql;
            }
        } else {
            $sql = $baseSelect . ' ' . $whereSql
                . ($whereSql !== '' ? ' AND ' : ' WHERE ')
                . '(l.title LIKE ? OR l.description LIKE ? OR l.tags LIKE ?)';
            $queryParams = array_merge($queryParams, [$like, $like, $like]);

            if ($sort === 'relevance') {
                $sql .= ' ORDER BY l.created_at DESC';
            } else {
                $sql .= ' ORDER BY ' . $orderSql;
            }
        }
    } else {
        $sql = $baseSelect . ' ' . $whereSql . ' ORDER BY ' . $orderSql;
    }

    $sql .= ' LIMIT ' . $limit . ' OFFSET ' . $offset;

    $stmt = $pdo->prepare($sql);
    $stmt->execute($queryParams);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (!is_array($rows)) {
        $rows = [];
    }

    $tagCounts = [];

    foreach ($rows as &$row) {
        $storagePath = $row['storage_path'] ?? null;
        if ($storagePath) {
            $row['cover_url'] = $publicBase . '/' . ltrim((string)$storagePath, '/');
        } else {
            $row['cover_url'] = null;
        }

        $downloadsCount = (int)($row['downloads_count'] ?? 0);
        $favoritesCount = (int)($row['favorites_count'] ?? 0);
        $row['downloads_count'] = $downloadsCount;
        $row['favorites_count'] = $favoritesCount;

        $rawTags = (string)($row['tags'] ?? '');
        $tagParts = preg_split('/[;,]+/', $rawTags) ?: [];
        $dedupTags = [];

        foreach ($tagParts as $tagPart) {
            $cleanTag = trim((string)$tagPart);
            if ($cleanTag === '') {
                continue;
            }

            $tagKey = strtolower($cleanTag);
            if (!isset($dedupTags[$tagKey])) {
                $dedupTags[$tagKey] = $cleanTag;
            }

            if (!isset($tagCounts[$tagKey])) {
                $tagCounts[$tagKey] = ['tag' => $cleanTag, 'count' => 1];
            } else {
                $tagCounts[$tagKey]['count']++;
            }
        }

        $row['tags'] = array_values($dedupTags);

        $isOwner = $userId !== null && (int)$row['seller_user_id'] === (int)$userId;
        $row['is_owner'] = $isOwner;
        $row['can_manage'] = $isAdmin || (
            $isOwner
            && $tokenWorkspaceId !== null
            && (int)$row['workspace_id'] === (int)$tokenWorkspaceId
        );

        $row['seller_verified'] = !empty($row['seller_is_admin']);
        $row['trusted_seller'] = $downloadsCount >= 20 || $favoritesCount >= 10;

        unset($row['storage_path'], $row['seller_user_id'], $row['workspace_id'], $row['seller_is_admin']);
    }
    unset($row);

    $availableTags = array_values($tagCounts);
    usort($availableTags, static function (array $a, array $b): int {
        if ((int)$b['count'] !== (int)$a['count']) {
            return (int)$b['count'] <=> (int)$a['count'];
        }

        return strcmp((string)$a['tag'], (string)$b['tag']);
    });

    $availableTags = array_slice(array_map(static fn(array $entry): string => (string)$entry['tag'], $availableTags), 0, 30);

    echo json_encode([
        'success' => true,
        'items' => $rows,
        'meta' => [
            'page' => $page,
            'limit' => $limit,
            'query' => $q,
            'sort' => $sort,
            'available_tags' => $availableTags,
            'available_sorts' => $allowedSorts,
        ],
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'DB error']);
}
