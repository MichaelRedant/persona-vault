<?php
declare(strict_types=1);
require __DIR__ . '/../cors.php';
require __DIR__ . '/../db.php';
require __DIR__ . '/../auth_check.php'; // sets $user_id, $workspace_id

header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);
$itemType    = trim($input['item_type'] ?? '');
$itemId      = (int)($input['item_id'] ?? 0);
$title       = trim($input['title'] ?? '');
$description = trim($input['description'] ?? '');
$priceCents  = (int)($input['price_cents'] ?? 0);
$currency    = strtoupper(trim($input['currency'] ?? 'EUR'));
$visibility  = trim($input['visibility'] ?? 'public');
$tags        = trim($input['tags'] ?? '');
$coverFileId = isset($input['cover_file_id']) ? (int)$input['cover_file_id'] : null;

if (!in_array($itemType, ['persona','prompt','bundle','asset'], true)) {
  http_response_code(422); echo json_encode(['success'=>false,'error'=>'Invalid item_type']); exit;
}
if ($itemId <= 0 || $title === '') {
  http_response_code(422); echo json_encode(['success'=>false,'error'=>'Missing item_id or title']); exit;
}
if (!in_array($visibility, ['public','unlisted','private'], true)) {
  http_response_code(422); echo json_encode(['success'=>false,'error'=>'Invalid visibility']); exit;
}

try {
  $stmt = $pdo->prepare("
    INSERT INTO marketplace_listings
    (seller_user_id, workspace_id, item_type, item_id, title, description, price_cents, currency, status, visibility, tags, cover_file_id, published_at)
    VALUES (:seller, :ws, :type, :item, :title, :desc, :price, :cur, 'active', :vis, :tags, :cover, NOW())
  ");
  $stmt->execute([
    ':seller' => $user_id,
    ':ws'     => $workspace_id,
    ':type'   => $itemType,
    ':item'   => $itemId,
    ':title'  => $title,
    ':desc'   => $description,
    ':price'  => $priceCents,
    ':cur'    => $currency,
    ':vis'    => $visibility,
    ':tags'   => $tags,
    ':cover'  => $coverFileId
  ]);

  echo json_encode(['success' => true, 'id' => (int)$pdo->lastInsertId()]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'DB error']);
}
