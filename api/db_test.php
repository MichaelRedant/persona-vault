<?php
declare(strict_types=1);

require_once __DIR__ . '/env.php';

header('Content-Type: application/json');

$appEnv = strtolower((string) pv_env('APP_ENV', 'production'));
if (!in_array($appEnv, ['local', 'development'], true)) {
    http_response_code(404);
    echo json_encode(['error' => 'Not found']);
    exit;
}

require_once __DIR__ . '/db.php';

echo json_encode(['success' => true, 'message' => 'Database connection OK']);
