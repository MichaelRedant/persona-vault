<?php
declare(strict_types=1);

require __DIR__ . '/cors.php';
require __DIR__ . '/auth_check.php';

header('Content-Type: application/json');
echo json_encode([
    'success' => true,
    'user_id' => (int) $user_id,
    'workspace_id' => (int) $workspace_id,
    'is_admin' => (bool) $is_admin,
]);
