<?php
declare(strict_types=1);

/**
 * Public marketplace search (read-only).
 * - Non-admins: only active + public listings.
 * - Supports q, kind, tag, sort, paging.
 * - Returns absolute cover_url if cover_file_id present.
 */

require __DIR__ . '/../cors.php';       // 👈 CORS MOET EERST
require __DIR__ . '/../db.php';
require_once __DIR__ . '/../jwt_utils.php';

header('Content-Type: application/json');

// --- optional auth: admin can see everything
$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$tokenParam = $_GET['token'] ?? '';
$isAdmin = false;
$userId = null;
$jwt = null;
if (preg_match('/Bearer\s(\S+)/', $authHeader, $m)) {
    $jwt = $m[1];
} elseif ($tokenParam !== '') {
    $jwt = $tokenParam;
}
if ($jwt) {
    $decoded = validate_jwt($jwt);
    if ($decoded) {
        $isAdmin = !empty($decoded['is_admin']);
        $userId = $decoded['user_id'] ?? null;
    }
}

// --- inputs
$q      = isset($_GET['q'])    ? trim((string)$_GET['q'])    : '';
$kind   = isset($_GET['kind']) ? trim((string)$_GET['kind']) : '';
$tag    = isset($_GET['tag'])  ? trim((string)$_GET['tag'])  : '';
$limit  = max(1, min(60, (int)($_GET['limit'] ?? 24)));
$page   = max(1, (int)($_GET['page'] ?? 1));
$offset = ($page - 1) * $limit;
$sort   = $_GET['sort'] ?? 'recent'; // recent|price_asc|price_desc

// --- where / params
$wheres = [];
$params = [];

if (!$isAdmin) {
    $wheres[] = "l.status='active'";
    $wheres[] = "l.visibility='public'";
}
if ($kind !== '') {
    $wheres[] = "l.item_type = ?";
    $params[] = $kind;
}
if ($tag !== '') {
    // tag match (pragmatisch, TEXT field)
    $wheres[] = "(FIND_IN_SET(?, REPLACE(REPLACE(l.tags,' ',''), ';', ',')) > 0 OR l.tags LIKE ?)";
    $params[] = $tag;
    $params[] = '%' . $tag . '%';
}

$order = "l.created_at DESC";
if ($sort === 'price_asc')  $order = "l.price_cents ASC";
if ($sort === 'price_desc') $order = "l.price_cents DESC";

try {
    // --- detect FT availability (index with FULLTEXT on listings)
    $ftAvailable = false;
    try {
        $chk = $pdo->prepare("
          SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
          WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'marketplace_listings'
            AND INDEX_TYPE = 'FULLTEXT'
        ");
        $chk->execute();
        $ftAvailable = (bool)$chk->fetchColumn();
    } catch (Throwable $e) {
        $ftAvailable = false; // older MySQL/MariaDB, just ignore
    }

    $whereSql = $wheres ? ('WHERE ' . implode(' AND ', $wheres)) : '';

    // --- build base URL for covers
    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host   = $_SERVER['HTTP_HOST'] ?? 'localhost';
    // script: /vault/api/marketplace/listings_search.php → base: /vault
    $scriptPath   = str_replace('\\','/', $_SERVER['SCRIPT_NAME'] ?? '/');
    $apiDir       = dirname(dirname($scriptPath));         // /vault/api
    $vaultBase    = dirname($apiDir);                      // /vault
    $configured   = rtrim((string)getenv('PUBLIC_BASE_URL'), '/'); // e.g. https://www.xinudesign.be/vault
    $publicBase   = $configured !== '' ? $configured : ($scheme . '://' . $host . $vaultBase);

    // --- query
    if ($q !== '') {
        if ($ftAvailable) {
            // FT + LIKE safety-net
            $sql = "
              SELECT l.id, l.title, l.description, l.price_cents, l.currency, l.item_type,
                     l.seller_user_id,
                     l.cover_file_id,
                     f.storage_path
              FROM marketplace_listings l
              LEFT JOIN files f ON f.id = l.cover_file_id
              $whereSql" . ($whereSql ? ' AND ' : ' WHERE ') . "(
                (MATCH(l.title, l.description, l.tags) AGAINST (? IN NATURAL LANGUAGE MODE))
                OR (l.title LIKE ? OR l.description LIKE ?)
              )
              ORDER BY $order
              LIMIT $limit OFFSET $offset
            ";
            $execParams = array_merge($params, [$q, "%$q%", "%$q%"]);
        } else {
            // LIKE-only fallback
            $sql = "
              SELECT l.id, l.title, l.description, l.price_cents, l.currency, l.item_type,
                     l.seller_user_id,
                     l.cover_file_id,
                     f.storage_path
              FROM marketplace_listings l
              LEFT JOIN files f ON f.id = l.cover_file_id
              $whereSql" . ($whereSql ? ' AND ' : ' WHERE ') . "(
                l.title LIKE ? OR l.description LIKE ?
              )
              ORDER BY $order
              LIMIT $limit OFFSET $offset
            ";
            $execParams = array_merge($params, ["%$q%", "%$q%"]);
        }
        $stmt = $pdo->prepare($sql);
        $stmt->execute($execParams);
    } else {
        $sql = "
          SELECT l.id, l.title, l.description, l.price_cents, l.currency, l.item_type,
                 l.seller_user_id,
                 l.cover_file_id,
                 f.storage_path
          FROM marketplace_listings l
          LEFT JOIN files f ON f.id = l.cover_file_id
          $whereSql
          ORDER BY $order
          LIMIT $limit OFFSET $offset
        ";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
    }

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // --- normalize + cover_url
    foreach ($rows as &$r) {
        $sp = $r['storage_path'] ?? null;
        if ($sp) {
            $sp = ltrim($sp, '/');
            $r['cover_url'] = $publicBase . '/' . $sp;
        } else {
            $r['cover_url'] = null;
        }

        $r['is_owner'] = $userId !== null && (int)$r['seller_user_id'] === (int)$userId;
        unset($r['storage_path'], $r['seller_user_id']); // FE hoeft raw path niet te kennen
        // optioneel: formatteer prijs client-side
    }

    echo json_encode([
        'success' => true,
        'items'   => $rows,
        'meta'    => ['page' => $page, 'limit' => $limit]
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'DB error']);
}
