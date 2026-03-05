<?php
declare(strict_types=1);

require_once __DIR__ . '/env.php';

$jwtSecret = pv_env('JWT_SECRET');
if ($jwtSecret === null || $jwtSecret === '') {
    error_log('Missing required environment variable: JWT_SECRET');
    if (!headers_sent()) {
        header('Content-Type: application/json');
        http_response_code(500);
    }
    echo json_encode(['error' => 'Server configuration error']);
    exit;
}

if (!defined('JWT_SECRET')) {
    define('JWT_SECRET', $jwtSecret);
}
