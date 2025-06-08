<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
include 'db.php';

$id = $_GET['id'] ?? 0;

$stmt = $pdo->prepare("DELETE FROM prompts WHERE id = ?");
$stmt->execute([$id]);

echo json_encode(['success' => true]);
?>
