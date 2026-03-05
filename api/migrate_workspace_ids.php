<?php
declare(strict_types=1);

require __DIR__ . '/cors.php';
require __DIR__ . '/auth_check_admin.php';
require_once __DIR__ . '/env.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$allowMaintenance = pv_env('ALLOW_MAINTENANCE', '0');
if ($allowMaintenance !== '1') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Maintenance endpoint disabled']);
    exit;
}

try {
    $users = $pdo->query('SELECT id FROM users')->fetchAll(PDO::FETCH_ASSOC);

    $updated = [
        'personas' => 0,
        'prompts' => 0,
    ];

    foreach ($users as $user) {
        $userId = (int) $user['id'];

        $workspaceStmt = $pdo->prepare(
            'SELECT w.id
             FROM workspaces w
             LEFT JOIN workspace_members wm ON w.id = wm.workspace_id
             WHERE w.owner_id = :uid OR wm.user_id = :uid
             ORDER BY w.created_at ASC
             LIMIT 1'
        );
        $workspaceStmt->execute(['uid' => $userId]);
        $workspace = $workspaceStmt->fetch(PDO::FETCH_ASSOC);

        if (!$workspace) {
            continue;
        }

        $workspaceId = (int) $workspace['id'];

        $updatePersonas = $pdo->prepare(
            'UPDATE personas
             SET workspace_id = :wid
             WHERE user_id = :uid AND workspace_id IS NULL'
        );
        $updatePersonas->execute([
            'wid' => $workspaceId,
            'uid' => $userId,
        ]);
        $updated['personas'] += $updatePersonas->rowCount();

        $updatePrompts = $pdo->prepare(
            'UPDATE prompts
             SET workspace_id = :wid
             WHERE user_id = :uid AND workspace_id IS NULL'
        );
        $updatePrompts->execute([
            'wid' => $workspaceId,
            'uid' => $userId,
        ]);
        $updated['prompts'] += $updatePrompts->rowCount();
    }

    echo json_encode([
        'success' => true,
        'message' => 'Migration completed',
        'updated' => $updated,
    ]);
} catch (PDOException $e) {
    error_log('Workspace migration failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error',
    ]);
}
