<?php
require 'cors.php';
require 'db.php';
require 'auth_check_admin.php';

header('Content-Type: application/json');

try {
    $totalPersonas = $pdo->query("SELECT COUNT(*) FROM personas")->fetchColumn();
    $totalPrompts = $pdo->query("SELECT COUNT(*) FROM prompts")->fetchColumn();
    $avgPromptsPerPersona = $totalPersonas > 0 ? $totalPrompts / $totalPersonas : 0;

    $workspaceStmt = $pdo->query("SELECT w.id, w.name, COUNT(p.id) AS prompt_count FROM workspaces w LEFT JOIN prompts p ON p.workspace_id = w.id GROUP BY w.id ORDER BY prompt_count DESC LIMIT 1");
    $mostActive = $workspaceStmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'stats' => [
            'total_personas' => (int)$totalPersonas,
            'total_prompts' => (int)$totalPrompts,
            'average_prompts_per_persona' => (float)$avgPromptsPerPersona,
            'most_active_workspace' => $mostActive
        ]
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
