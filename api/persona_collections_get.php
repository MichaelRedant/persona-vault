<?php
header('Content-Type: application/json');
include 'cors.php';
include 'db.php';
require 'auth_check.php'; // ✅ haalt $user_id en $workspace_id uit JWT

try {
    $stmt = $pdo->prepare("
        SELECT pc.persona_id, pc.collection_id
        FROM persona_collections pc
        JOIN personas p ON p.id = pc.persona_id
        WHERE p.user_id = ? AND p.workspace_id = ?
    ");
    $stmt->execute([$user_id, $workspace_id]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($rows);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to fetch persona-collection links: ' . $e->getMessage()
    ]);
}
