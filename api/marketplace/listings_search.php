<?php
declare(strict_types=1);
require __DIR__ . '/../cors.php';
require __DIR__ . '/../db.php';

header('Content-Type: application/json');

$q      = $_GET['q']        ?? '';
$kind   = $_GET['kind']     ?? ''; // persona|prompt|bundle|asset
$tag    = $_GET['tag']      ?? '';
$limit  = max(1, min(60, (int)($_GET['limit'] ?? 24)));
$page   = max(1, (int)($_GET['page'] ?? 1));
$offset = ($page - 1) * $limit;
$sort   = $_GET['sort'] ?? 'recent'; // recent|price_asc|price_desc

$wheres = ["status='active'", "visibility='public'"];
$params = [];

if ($kind) {
  $wheres[] = "item_type = ?";
  $params[] = $kind;
}
if ($tag) {
  $wheres[] = "FIND_IN_SET(?, REPLACE(REPLACE(tags,' ',''), ';', ',')) > 0 OR tags LIKE ?";
  $params[] = $tag;
  $params[] = '%' . $tag . '%';
}

$order = "created_at DESC";
if ($sort === 'price_asc')  $order = "price_cents ASC";
if ($sort === 'price_desc') $order = "price_cents DESC";

try {
  if ($q !== '') {
    // FT (als beschikbaar), anders LIKE
    $sql = "
      SELECT id, title, description, price_cents, currency, cover_file_id, item_type
      FROM marketplace_listings
      WHERE " . implode(' AND ', $wheres) . "
        AND (
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
      WHERE " . implode(' AND ', $wheres) . "
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
