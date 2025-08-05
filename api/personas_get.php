<?php
header('Content-Type: application/json');
include 'cors.php';
require 'auth_check.php'; // ✅ haalt $user_id & $workspace_id op
include 'db.php';

try {
    // ✅ Gebruik LEFT JOIN om persona's zonder collecties ook te tonen
    $stmt = $pdo->prepare("
        SELECT 
            p.id, p.name, p.description, p.favorite, p.tags,
            p.created_at, p.updated_at,
            pc.collection_id
        FROM personas p
        LEFT JOIN persona_collections pc ON p.id = pc.persona_id
        WHERE p.user_id = ? AND (p.workspace_id = ? OR p.workspace_id IS NULL)
        ORDER BY p.created_at DESC
    ");
    $stmt->execute([$user_id, $workspace_id]);
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
