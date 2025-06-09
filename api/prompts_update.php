<?php
header('Content-Type: application/json');
include 'cors.php';
include 'db.php';

include 'jwt_utils.php';

// Fix voor servers die Authorization header strippen bij POST requests
if (!isset($_SERVER['HTTP_AUTHORIZATION'])) {
    if (function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        if (isset($headers['Authorization'])) {
            $_SERVER['HTTP_AUTHORIZATION'] = $headers['Authorization'];
            error_log("Backend log: Recovered Authorization header via apache_request_headers");
        } else {
            error_log("Backend log: Authorization header NOT found even in apache_request_headers");
        }
    } else {
        error_log("Backend log: apache_request_headers not available");
    }
}


if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    http_response_code(401);
    echo json_encode(['error' => 'Missing or invalid Authorization header']);
    exit;
}

$jwt = $matches[1];
$decoded = validate_jwt($jwt); 

if (!$decoded) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid or expired token']);
    exit;
}

$user_id = $decoded['user_id'] ?? null;

$data = json_decode(file_get_contents('php://input'), true);

$id = $data['id'] ?? 0;
$title = $data['title'] ?? '';
$content = $data['content'] ?? '';
$category = $data['category'] ?? '';
$favorite = isset($data['favorite']) ? (int)$data['favorite'] : 0;
$tags = isset($data['tags']) && is_array($data['tags'])
    ? implode(',', array_map('trim', $data['tags']))
    : '';

$stmt = $pdo->prepare("UPDATE prompts SET title = ?, content = ?, category = ?, favorite = ?, tags = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?");
$stmt->execute([$title, $content, $category, $favorite, $tags, $id, $user_id]);

echo json_encode(['success' => true]);
