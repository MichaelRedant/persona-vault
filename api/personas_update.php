<?php
error_log("Backend log: Authorization header: " . ($_SERVER['HTTP_AUTHORIZATION'] ?? 'NOT SET'));

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

// Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// JWT auth
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
$name = $data['name'] ?? '';
$description = $data['description'] ?? '';
$favorite = isset($data['favorite']) ? (int)$data['favorite'] : 0;
$tags = isset($data['tags']) && is_array($data['tags'])
    ? implode(',', array_map('trim', $data['tags']))
    : '';

// ✅ CollectionId → industry fix → lege string → NULL in DB
$collectionIds = [];

if (isset($data['collectionIds']) && is_array($data['collectionIds'])) {
    $collectionIds = array_filter(array_map('intval', $data['collectionIds']));
}


// Update persona data (zonder collection_id!)
$stmt = $pdo->prepare("UPDATE personas 
    SET name = ?, description = ?, favorite = ?, tags = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ? AND user_id = ?");
$stmt->execute([$name, $description, $favorite, $tags, $id, $user_id]);

// 🔒 Check eigendom van persona
$checkStmt = $pdo->prepare("SELECT id FROM personas WHERE id = ? AND user_id = ?");
$checkStmt->execute([$id, $user_id]);
if ($checkStmt->rowCount() === 0) {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

// 🧩 Sync persona_collections
try {
    $pdo->beginTransaction();

    // Alles wissen
    $deleteStmt = $pdo->prepare("DELETE FROM persona_collections WHERE persona_id = ?");
    $deleteStmt->execute([$id]);

    // Opnieuw toevoegen
    if (!empty($collectionIds)) {
        $insertStmt = $pdo->prepare("INSERT INTO persona_collections (persona_id, collection_id, user_id) VALUES (?, ?, ?)");
foreach ($collectionIds as $colId) {
    $insertStmt->execute([$id, $colId, $user_id]);
}

    }

    $pdo->commit();
} catch (PDOException $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'Failed to update collections: ' . $e->getMessage()]);
    exit;
}

// ✅ Success response pas NA commit
echo json_encode(['success' => true]);

