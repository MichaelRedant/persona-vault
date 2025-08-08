<?php
declare(strict_types=1);

header('Content-Type: application/json');
require __DIR__ . '/../cors.php';
require __DIR__ . '/../db.php';
require_once __DIR__ . '/../jwt_utils.php';

// Optional auth: determine if caller is admin
$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$isAdmin = false;
if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    $decoded = validate_jwt($matches[1]);
    $isAdmin = $decoded && !empty($decoded['is_admin']);
}

$q      = $_GET['q']    ?? '';
$kind   = $_GET['kind'] ?? '';
$tag    = $_GET['tag']  ?? '';
$limit  = max(1, min(60, (int)($_GET['limit'] ?? 24)));
$page   = max(1, (int)($_GET['page'] ?? 1));
$offset = ($page - 1) * $limit;
$sort   = $_GET['sort'] ?? 'recent';

$wheres = [];
$params = [];

if (!$isAdmin) {
    $wheres[] = "status='active'";
    $wheres[] = "visibility='public'";
}
if ($kind) {
    $wheres[] = 'item_type = ?';
    $params[] = $kind;
}
if ($tag) {
    $wheres[] = "FIND_IN_SET(?, REPLACE(REPLACE(tags,' ',''), ';', ',')) > 0 OR tags LIKE ?";
    $params[] = $tag;
    $params[] = '%' . $tag . '%';
}

$order = 'created_at DESC';
if ($sort === 'price_asc') {
    $order = 'price_cents ASC';
}
if ($sort === 'price_desc') {
    $order = 'price_cents DESC';
}

try {
    $whereSql = $wheres ? 'WHERE ' . implode(' AND ', $wheres) : '';
    if ($q !== '') {
        $sql = "
            SELECT id, title, description, price_cents, currency, cover_file_id, item_type
            FROM marketplace_listings
            $whereSql" . ($whereSql ? ' AND ' : ' WHERE ') . "(
                (MATCH(title, description, tags) AGAINST (? IN NATURAL LANGUAGE MODE))
                OR (title LIKE ? OR description LIKE ?)
            )
            ORDER BY $order
            LIMIT $limit OFFSET $offset
        ";
        $paramsFT = array_merge($params, [$q, "%$q%", "%$q%"]); 
        $stmt = $pdo->prepare($sql);
        $stmt->execute($paramsFT);
    } else {
        $sql = "
            SELECT id, title, description, price_cents, currency, cover_file_id, item_type
            FROM marketplace_listings
            $whereSql
            ORDER BY $order
            LIMIT $limit OFFSET $offset
        ";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
    }

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'items' => $rows]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'DB error']);
}
