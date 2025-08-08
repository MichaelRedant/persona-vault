<?php
declare(strict_types=1);
require __DIR__ . '/../cors.php';
require __DIR__ . '/../db.php';
require __DIR__ . '/../auth_check.php';

header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);
$id = (int)($input['id'] ?? 0);
if ($id <= 0) { http_response_code(422); echo json_encode(['success'=>false,'error'=>'Missing id']); exit; }

try {
  $check = $pdo->prepare("SELECT seller_user_id FROM marketplace_listings WHERE id=?");
  $check->execute([$id]);
  $owner = $check->fetchColumn();
  if (!$owner) { http_response_code(404); echo json_encode(['success'=>false,'error'=>'Listing not found']); exit; }
  if ((int)$owner !== (int)$user_id && !$is_admin) {
    http_response_code(403); echo json_encode(['success'=>false,'error'=>'Not allowed']); exit;
  }

  $fields = [];
  $params = [];
  foreach (['title','description','tags','visibility','status','price_cents','currency','cover_file_id'] as $k) {
    if (array_key_exists($k, $input)) {
      $fields[] = "$k = :$k";
      $params[":$k"] = $input[$k];
    }
  }
  if (!$fields) { echo json_encode(['success'=>true]); exit; }

  $sql = "UPDATE marketplace_listings SET ".implode(',', $fields)." WHERE id=:id";
  $params[':id'] = $id;
  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);

  echo json_encode(['success'=>true]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success'=>false,'error'=>'DB error']);
}
