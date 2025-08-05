<?php
header('Content-Type: application/json');
include 'cors.php';
require 'auth_check.php'; // ✅ haalt $user_id en $workspace_id op
include 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ✅ Inkomende JSON loggen (optioneel)
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

// ✅ Collection IDs filteren
$collection_ids = isset($data['collection_ids']) && is_array($data['collection_ids'])
    ? array_filter(array_map('intval', $data['collection_ids']), fn($id) => $id > 0)
    : [];

if ($name === '' || $description === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Name and description are required']);
    exit;
}

try {
    // 🔹 1. Voeg persona toe met workspace_id
    $stmt = $pdo->prepare("INSERT INTO personas (user_id, workspace_id, name, description, tags) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$user_id, $workspace_id, $name, $description, $tags]);
    $persona_id = $pdo->lastInsertId();

    // 🔹 2. Koppel collecties (enkel als ze er zijn)
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
