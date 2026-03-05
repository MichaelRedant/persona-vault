<?php
declare(strict_types=1);

require __DIR__ . '/cors.php';

header('Content-Type: application/json');
http_response_code(410);
echo json_encode([
    'success' => false,
    'message' => 'Deprecated endpoint. Use test_token.php.',
]);
