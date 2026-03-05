<?php
declare(strict_types=1);

if (!function_exists('pv_load_env_file')) {
    /**
     * Load KEY=VALUE pairs into process environment without overriding
     * already defined variables.
     */
    function pv_load_env_file(string $path): void
    {
        if (!is_file($path) || !is_readable($path)) {
            return;
        }

        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        if ($lines === false) {
            return;
        }

        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '' || str_starts_with($line, '#')) {
                continue;
            }

            $separatorPos = strpos($line, '=');
            if ($separatorPos === false) {
                continue;
            }

            $key = trim(substr($line, 0, $separatorPos));
            $value = trim(substr($line, $separatorPos + 1));

            if ($key === '') {
                continue;
            }

            if (
                (str_starts_with($value, '"') && str_ends_with($value, '"')) ||
                (str_starts_with($value, "'") && str_ends_with($value, "'"))
            ) {
                $value = substr($value, 1, -1);
            }

            if (
                getenv($key) !== false ||
                array_key_exists($key, $_ENV) ||
                array_key_exists($key, $_SERVER)
            ) {
                continue;
            }

            putenv($key . '=' . $value);
            $_ENV[$key] = $value;
            $_SERVER[$key] = $value;
        }
    }
}

if (!function_exists('pv_env_bootstrap')) {
    function pv_env_bootstrap(): void
    {
        static $bootstrapped = false;
        if ($bootstrapped) {
            return;
        }

        $bootstrapped = true;
        pv_load_env_file(dirname(__DIR__) . DIRECTORY_SEPARATOR . '.env');
        pv_load_env_file(__DIR__ . DIRECTORY_SEPARATOR . '.env');
    }
}

if (!function_exists('pv_env')) {
    function pv_env(string $key, ?string $default = null): ?string
    {
        pv_env_bootstrap();

        $value = getenv($key);
        if ($value === false) {
            if (array_key_exists($key, $_ENV)) {
                return (string) $_ENV[$key];
            }
            if (array_key_exists($key, $_SERVER)) {
                return (string) $_SERVER[$key];
            }
            return $default;
        }

        return (string) $value;
    }
}

