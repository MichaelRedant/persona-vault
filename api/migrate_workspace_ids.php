<?php
require 'db.php';

header('Content-Type: application/json');

try {
    // 🔄 Haal alle users op
    $users = $pdo->query("SELECT id FROM users")->fetchAll(PDO::FETCH_ASSOC);

    $updated = [
        'personas' => 0,
        'prompts' => 0
    ];

    foreach ($users as $user) {
        $user_id = $user['id'];

        // 🔍 Haal workspace ID op die deze user bezit (of er lid van is)
        $stmt = $pdo->prepare("
            SELECT w.id 
            FROM workspaces w
            LEFT JOIN workspace_members wm ON w.id = wm.workspace_id
            WHERE w.owner_id = :uid OR wm.user_id = :uid
            ORDER BY w.created_at ASC
            LIMIT 1
        ");
        $stmt->execute(['uid' => $user_id]);
        $workspace = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($workspace) {
            $workspace_id = $workspace['id'];

            // ✅ Update personas zonder workspace_id
            $updatePersonas = $pdo->prepare("
                UPDATE personas 
                SET workspace_id = :wid 
                WHERE user_id = :uid AND workspace_id IS NULL
            ");
            $updatePersonas->execute([
                'wid' => $workspace_id,
                'uid' => $user_id
            ]);
            $updated['personas'] += $updatePersonas->rowCount();

            // ✅ Update prompts zonder workspace_id
            $updatePrompts = $pdo->prepare("
                UPDATE prompts 
                SET workspace_id = :wid 
                WHERE user_id = :uid AND workspace_id IS NULL
            ");
            $updatePrompts->execute([
                'wid' => $workspace_id,
                'uid' => $user_id
            ]);
            $updated['prompts'] += $updatePrompts->rowCount();
        }
    }

    echo json_encode([
        'success' => true,
        'message' => 'Migration completed',
        'updated' => $updated
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
