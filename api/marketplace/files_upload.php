<?php
declare(strict_types=1);
require __DIR__ . '/../cors.php';
require __DIR__ . '/../db.php';
require __DIR__ . '/../auth_check.php';

header('Content-Type: application/json');

$allowed = ['image/png','image/jpeg','image/webp','image/gif','application/pdf'];
$maxSize = 8 * 1024 * 1024; // 8MB

if (!isset($_FILES['file'])) {
  http_response_code(400); echo json_encode(['success'=>false,'error'=>'No file']); exit;
}

$f = $_FILES['file'];
if ($f['error'] !== UPLOAD_ERR_OK) {
  http_response_code(400); echo json_encode(['success'=>false,'error'=>'Upload error']); exit;
}
if ($f['size'] > $maxSize) {
  http_response_code(413); echo json_encode(['success'=>false,'error'=>'File too large']); exit;
}

$tmp  = $f['tmp_name'];
$name = preg_replace('/[^\w\-. ]+/', '_', $f['name']);
$mime = mime_content_type($tmp);
if (!in_array($mime, $allowed, true)) {
  http_response_code(415); echo json_encode(['success'=>false,'error'=>'Unsupported type']); exit;
}

$dir = __DIR__ . '/../../uploads/' . date('Y/m');
if (!is_dir($dir)) mkdir($dir, 0775, true);
$basename = bin2hex(random_bytes(8)) . '-' . $name;
$destPath = $dir . '/' . $basename;

if (!move_uploaded_file($tmp, $destPath)) {
  http_response_code(500); echo json_encode(['success'=>false,'error'=>'Save failed']); exit;
}

$storageRel = 'uploads/' . date('Y/m') . '/' . $basename;

try {
  $stmt = $pdo->prepare("
    INSERT INTO files (uploader_user_id, workspace_id, storage_path, mime_type, size_bytes)
    VALUES (?,?,?,?,?)
  ");
  $stmt->execute([$user_id, $workspace_id, $storageRel, $mime, (int)$f['size']]);

  echo json_encode(['success'=>true,'file_id'=>(int)$pdo->lastInsertId(), 'path'=>$storageRel]);
} catch (Throwable $e) {
  http_response_code(500); echo json_encode(['success'=>false,'error'=>'DB error']);
}
