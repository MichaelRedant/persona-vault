<?php
header('Content-Type: application/json');
require 'cors.php';
require 'auth_check.php'; // ✅ Haalt $user_id en $workspace_id op
require 'db.php';

try {
    // ✅ Haal alle collections voor deze user én workspace
    $stmt = $pdo->prepare("
        SELECT id, name, created_at, updated_at 
        FROM collections 
        WHERE user_id = ? AND workspace_id = ? 
        ORDER BY created_at DESC
    ");
    $stmt->execute([$user_id, $workspace_id]);
    $collections = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // ✅ Zorg voor consistente datumformaten (string of leeg)
    foreach ($collections as &$collection) {
        $collection['created_at'] = $collection['created_at'] ?? '';
        $collection['updated_at'] = $collection['updated_at'] ?? '';
    }

    echo json_encode($collections);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch collections: ' . $e->getMessage()]);
}
