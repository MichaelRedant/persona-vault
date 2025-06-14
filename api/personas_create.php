<?php
header('Content-Type: application/json');
include 'cors.php';
include 'db.php';
include 'jwt_utils.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ✅ Authorization header
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
if (!$user_id) {
    http_response_code(401);
    echo json_encode(['error' => 'Token missing user_id']);
    exit;
}

$raw = file_get_contents('php://input');
error_log("📥 Incoming JSON: $raw");

$data = json_decode($raw, true);
if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON input']);
    exit;
}

$name = trim($data['name'] ?? '');
$description = trim($data['description'] ?? '');
$tags = isset($data['tags']) && is_array($data['tags'])
    ? implode(',', array_map('trim', $data['tags']))
    : '';

// ✅ Collection IDs — veilig filteren
$collection_ids = isset($data['collection_ids']) && is_array($data['collection_ids'])
    ? array_filter(array_map('intval', $data['collection_ids']), fn($id) => $id > 0)
    : [];

if ($name === '' || $description === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Name and description are required']);
    exit;
}

try {
    // 🔹 1. Persona toevoegen
    $stmt = $pdo->prepare("INSERT INTO personas (user_id, name, description, tags) VALUES (?, ?, ?, ?)");
    $stmt->execute([$user_id, $name, $description, $tags]);
    $persona_id = $pdo->lastInsertId();

    // 🔹 2. Collectie-relaties aanmaken
    if (!empty($collection_ids)) {
        $stmtAssoc = $pdo->prepare("INSERT INTO persona_collections (persona_id, collection_id, user_id) VALUES (?, ?, ?)");
foreach ($collection_ids as $cid) {
    $stmtAssoc->execute([$persona_id, $cid, $user_id]);
}
    }

    echo json_encode(['success' => true, 'id' => $persona_id]);
} catch (PDOException $e) {
    error_log("❌ DB Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database error', 'details' => $e->getMessage()]);
}
