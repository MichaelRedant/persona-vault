<?php
declare(strict_types=1);
require __DIR__ . '/../cors.php';
require __DIR__ . '/../db.php';
require __DIR__ . '/../auth_check.php';

header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);
$listingId = (int)($input['listing_id'] ?? 0);
if ($listingId <= 0) { http_response_code(422); echo json_encode(['success'=>false,'error'=>'Missing listing_id']); exit; }

try {
  // bestaat al?
  $s = $pdo->prepare("SELECT id FROM marketplace_favorites WHERE listing_id=? AND user_id=?");
  $s->execute([$listingId, $user_id]);
  $favId = $s->fetchColumn();

  if ($favId) {
    $pdo->prepare("DELETE FROM marketplace_favorites WHERE id=?")->execute([$favId]);
    echo json_encode(['success'=>true,'favorite'=>false]);
  } else {
    $pdo->prepare("INSERT INTO marketplace_favorites (listing_id, user_id) VALUES (?,?)")->execute([$listingId, $user_id]);
    echo json_encode(['success'=>true,'favorite'=>true]);
  }
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success'=>false,'error'=>'DB error']);
}
