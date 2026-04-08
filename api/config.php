<?php
// ============================================================
//  api/config.php
// ============================================================

define('DB_HOST',    'localhost');
define('DB_NAME',    'desruelle');
define('DB_USER',    'root');
define('DB_PASS',    '');
define('DB_CHARSET', 'utf8mb4');

function setCorsHeaders(): void {
    // Autorise TOUTES les origines localhost en dev
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

    if (
        $origin === '' ||
        preg_match('#^http://localhost(:\d+)?$#', $origin) ||
        $origin === 'https://conciergerie-desruelle.fr'
    ) {
        header('Access-Control-Allow-Origin: ' . ($origin ?: '*'));
    }

    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Allow-Credentials: true');
    header('Content-Type: application/json; charset=utf-8');

    // Répondre immédiatement aux preflight OPTIONS
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

function getDB(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = 'mysql:host=' . DB_HOST
             . ';dbname=' . DB_NAME
             . ';charset=' . DB_CHARSET;
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    }
    return $pdo;
}

function jsonResponse(mixed $data, int $code = 200): never {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function jsonError(string $message, int $code = 400): never {
    jsonResponse(['success' => false, 'error' => $message], $code);
}
