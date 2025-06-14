<?php
header('Content-Type: application/json');
include 'cors.php';
include 'db.php';
require_once 'jwt_utils.php';

// ✅ Auth header check
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

try {
    // ✅ Gebruik LEFT JOIN om persona's zonder collecties ook te tonen
    $stmt = $pdo->prepare("
        SELECT 
            p.id, p.name, p.description, p.favorite, p.tags,
            p.created_at, p.updated_at,
            pc.collection_id
        FROM personas p
        LEFT JOIN persona_collections pc ON p.id = pc.persona_id
        WHERE p.user_id = ?
        ORDER BY p.created_at DESC
    ");
    $stmt->execute([$user_id]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // ✅ Groepeer per persona met alle bijhorende collection_ids[]
    $personasMap = [];

    foreach ($rows as $row) {
        $id = $row['id'];

        if (!isset($personasMap[$id])) {
            $personasMap[$id] = [
                'id' => $id,
                'name' => $row['name'],
                'description' => $row['description'],
                'favorite' => (int)$row['favorite'],
                'tags' => $row['tags'] ? array_map('trim', explode(',', $row['tags'])) : [],
                'collection_names' => [],
                'created_at' => $row['created_at'],
                'updated_at' => $row['updated_at'],
                'collection_ids' => [],
            ];
        }

        if (!is_null($row['collection_id'])) {
    $personasMap[$id]['collection_ids'][] = (int)$row['collection_id'];
    $personasMap[$id]['collection_ids'] = array_unique($personasMap[$id]['collection_ids']);
}

    }

    // ✅ Converteer map naar array en geef terug als JSON
    $personas = array_values($personasMap);
    echo json_encode($personas);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch personas: ' . $e->getMessage()]);
}
