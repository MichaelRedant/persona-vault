<?php
header('Content-Type: application/json');
include 'cors.php';
include 'db.php';
require_once 'auth_check.php';

$data = json_decode(file_get_contents('php://input'), true);

$name = trim($data['name'] ?? '');
$address = trim($data['address'] ?? '');
$email = trim($data['email'] ?? '');
$role = trim($data['role'] ?? '');
$photo = $data['photo'] ?? '';
$currentPassword = $data['currentPassword'] ?? '';
$newPassword = $data['newPassword'] ?? '';

$fields = [];
$params = [];

if ($name !== '') {
    $fields[] = 'profile_name = ?';
    $params[] = $name;
}
if ($address !== '') {
    $fields[] = 'address = ?';
    $params[] = $address;
}
if ($email !== '') {
    $fields[] = 'email = ?';
    $params[] = $email;
}
if ($role !== '') {
    $fields[] = 'role = ?';
    $params[] = $role;
}
if ($photo !== '') {
    $fields[] = 'photo = ?';
    $params[] = $photo;
}

if ($newPassword !== '') {
    if (!$currentPassword) {
        http_response_code(400);
        echo json_encode(['error' => 'Current password required']);
        exit;
    }
    $stmt = $pdo->prepare('SELECT password_hash FROM users WHERE id = ?');
    $stmt->execute([$user_id]);
    $hash = $stmt->fetchColumn();
    if (!$hash || !password_verify($currentPassword, $hash)) {
        http_response_code(400);
        echo json_encode(['error' => 'Current password incorrect']);
        exit;
    }
    $fields[] = 'password_hash = ?';
    $params[] = password_hash($newPassword, PASSWORD_DEFAULT);
}

if (empty($fields)) {
    echo json_encode(['success' => true]);
    exit;
}

$params[] = $user_id;
$sql = 'UPDATE users SET ' . implode(', ', $fields) . ' WHERE id = ?';
$stmt = $pdo->prepare($sql);
$stmt->execute($params);

echo json_encode(['success' => true]);
