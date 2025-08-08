<?php
declare(strict_types=1);
require __DIR__ . '/../cors.php';
require __DIR__ . '/../db.php';

header('Content-Type: application/json');

// optional JWT: if present, auth_check to get $user_id
$user_id = null;
if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
  require __DIR__ . '/../auth_check.php';
}

$input = json_decode(file_get_contents('php://input'), true);
$listingId = (int)($input['listing_id'] ?? 0);
$orderId   = isset($input['order_id']) ? (int)$input['order_id'] : null;

if ($listingId <= 0) { http_response_code(422); echo json_encode(['success'=>false,'error'=>'Missing listing_id']); exit; }

try {
  $ip  = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
  $ua  = $_SERVER['HTTP_USER_AGENT'] ?? '';
  $ipH = hash('sha256', $ip);

  $stmt = $pdo->prepare("
    INSERT INTO marketplace_download_events (listing_id, user_id, order_id, ip_hash, ua)
    VALUES (?,?,?,?,?)
  ");
  $stmt->execute([$listingId, $user_id, $orderId, $ipH, substr($ua, 0, 255)]);

  echo json_encode(['success'=>true]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success'=>false,'error'=>'DB error']);
}
