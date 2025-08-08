<?php
header('Content-Type: application/json');
include 'cors.php';
include 'db.php';
require_once 'auth_check.php'; // ✅ haalt $user_id & $workspace_id veilig uit JWT

// Lees input
$data = json_decode(file_get_contents('php://input'), true);

$id = $data['id'] ?? 0;
$name = $data['name'] ?? '';
$description = $data['description'] ?? '';
$favorite = isset($data['favorite']) ? (int)$data['favorite'] : 0;
$tags = isset($data['tags']) && is_array($data['tags']) ? implode(',', array_map('trim', $data['tags'])) : '';
$collectionIds = [];

if (isset($data['collectionIds']) && is_array($data['collectionIds'])) {
    $collectionIds = array_filter(array_map('intval', $data['collectionIds']));
}

// ✅ Check of de persona bestaat en of de gebruiker eigenaar is (admins mogen alles)
if ($is_admin) {
    $checkStmt = $pdo->prepare("SELECT user_id FROM personas WHERE id = ? AND workspace_id = ?");
    $checkStmt->execute([$id, $workspace_id]);
} else {
    $checkStmt = $pdo->prepare("SELECT user_id FROM personas WHERE id = ? AND user_id = ? AND workspace_id = ?");
    $checkStmt->execute([$id, $user_id, $workspace_id]);
}
$ownerId = $checkStmt->fetchColumn();
if (!$ownerId) {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

// ✅ Update persona zelf
$params = [$name, $description, $favorite, $tags, $id];
if ($is_admin) {
    $stmt = $pdo->prepare("UPDATE personas
    SET name = ?, description = ?, favorite = ?, tags = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND workspace_id = ?");
    $params[] = $workspace_id;
    $stmt->execute($params);
    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Persona not found']);
        exit;
    }
} else {
    $stmt = $pdo->prepare("UPDATE personas
    SET name = ?, description = ?, favorite = ?, tags = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ? AND workspace_id = ?");
    $params[] = $user_id;
    $params[] = $workspace_id;
    $stmt->execute($params);
    if ($stmt->rowCount() === 0) {
        http_response_code(403);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
}

// ✅ Sync collections
try {
    $pdo->beginTransaction();

    // 🧹 Delete oude
    $deleteStmt = $pdo->prepare("DELETE FROM persona_collections WHERE persona_id = ?");
    $deleteStmt->execute([$id]);

    // ➕ Voeg nieuwe toe
    if (!empty($collectionIds)) {
        $insertStmt = $pdo->prepare("
            INSERT INTO persona_collections (persona_id, collection_id, user_id) 
            VALUES (?, ?, ?)
        ");
        foreach ($collectionIds as $colId) {
            $insertStmt->execute([$id, $colId, $ownerId]);
        }
    }

    $pdo->commit();
    echo json_encode(['success' => true]);

} catch (PDOException $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'Failed to update collections: ' . $e->getMessage()]);
}
