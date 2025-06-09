<?php
require_once __DIR__ . '/vendor/autoload.php';
require_once 'config.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

function generate_jwt($payload, $expiry_seconds = 3600) {
    $issuedAt = time();
    $expire = $issuedAt + $expiry_seconds;

    $payload = array_merge($payload, [
        'iat' => $issuedAt,
        'exp' => $expire
    ]);

    return JWT::encode($payload, JWT_SECRET, 'HS256');
}

function validate_jwt($token) {
    try {
        $decoded = JWT::decode($token, new Key(JWT_SECRET, 'HS256'));
        return (array) $decoded;
    } catch (Exception $e) {
        error_log('JWT decode error: ' . $e->getMessage());
        return false;
    }
}

// Fallback fix voor sommige buggy servers (LSAPI / mod_php) → Authorization header for POST
if (!isset($_SERVER['HTTP_AUTHORIZATION'])) {
    if (function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        if (isset($headers['Authorization'])) {
            $_SERVER['HTTP_AUTHORIZATION'] = $headers['Authorization'];
        }
    }
}

