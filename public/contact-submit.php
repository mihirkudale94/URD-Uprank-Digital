<?php
declare(strict_types=1);

const MAX_BODY_BYTES = 32768;
const RATE_LIMIT_WINDOW_SECONDS = 900;
const RATE_LIMIT_MAX_REQUESTS = 5;
const DEFAULT_RECIPIENT = 'sachin@uprankdigital.com';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: strict-origin-when-cross-origin');
header('Cache-Control: no-store, max-age=0');

function send_json(int $status, array $payload): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    exit;
}

function request_id(): string
{
    try {
        return bin2hex(random_bytes(8));
    } catch (Throwable $error) {
        return str_replace('.', '', uniqid('', true));
    }
}

function clean_text($value, int $maxLength = 2000): string
{
    $text = trim(strip_tags((string) $value));
    $text = str_replace(["\r", "\n"], ' ', $text);
    $text = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]+/u', ' ', $text) ?? $text;
    $text = preg_replace('/\s{2,}/u', ' ', $text) ?? $text;

    return substr($text, 0, $maxLength);
}

function header_text(string $value): string
{
    return str_replace(["\r", "\n", '<', '>'], '', clean_text($value, 120));
}

function normalize_email($value)
{
    $email = filter_var(trim((string) $value), FILTER_VALIDATE_EMAIL);
    return $email ?: false;
}

function normalize_phone($value): string
{
    $phone = clean_text($value, 40);
    $digits = preg_replace('/\D+/', '', $phone) ?? '';

    if (strlen($digits) < 7 || strlen($digits) > 18 || !preg_match('/^\+?[0-9][0-9\s().-]+$/', $phone)) {
        return '';
    }

    return $phone;
}

function normalize_url($value, int $maxLength = 300): string
{
    $url = trim((string) $value);

    if ($url === '') {
        return '';
    }

    if (!preg_match('/^https?:\/\//i', $url)) {
        $url = 'https://' . $url;
    }

    $url = filter_var($url, FILTER_VALIDATE_URL);
    if (!$url) {
        return '';
    }

    $parts = parse_url($url);
    $scheme = strtolower((string) ($parts['scheme'] ?? ''));
    $host = (string) ($parts['host'] ?? '');

    if (($scheme !== 'http' && $scheme !== 'https') || $host === '') {
        return '';
    }

    return substr($url, 0, $maxLength);
}

function current_host(): string
{
    $host = $_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? '';
    $host = strtolower(preg_replace('/:\d+$/', '', (string) $host));

    return preg_replace('/[^a-z0-9.-]/', '', $host) ?? '';
}

function origin_host(string $origin): string
{
    $origin = trim($origin);
    $host = strpos($origin, '://') === false ? $origin : (string) parse_url($origin, PHP_URL_HOST);
    $host = preg_replace('/:\d+$/', '', $host) ?? '';

    return strtolower(preg_replace('/[^a-z0-9.-]/', '', $host) ?? '');
}

function allowed_origin_hosts(): array
{
    $hosts = array_filter([current_host(), 'uprankdigital.com', 'www.uprankdigital.com']);
    $configured = getenv('CONTACT_ALLOWED_ORIGINS');

    if (is_string($configured) && trim($configured) !== '') {
        foreach (explode(',', $configured) as $origin) {
            $origin = trim($origin);
            $host = origin_host($origin);
            if ($host !== '') {
                $hosts[] = $host;
            }
        }
    }

    return array_values(array_unique($hosts));
}

function assert_same_origin(): void
{
    $allowedHosts = allowed_origin_hosts();
    $origin = (string) ($_SERVER['HTTP_ORIGIN'] ?? '');
    $referer = (string) ($_SERVER['HTTP_REFERER'] ?? '');

    if ($origin !== '' && !in_array(origin_host($origin), $allowedHosts, true)) {
        send_json(403, ['success' => false, 'message' => 'Request blocked. Please refresh the page and try again.']);
    }

    if ($origin === '' && $referer !== '' && !in_array(origin_host($referer), $allowedHosts, true)) {
        send_json(403, ['success' => false, 'message' => 'Request blocked. Please refresh the page and try again.']);
    }
}

function storage_dir(): string
{
    $configured = getenv('CONTACT_STORAGE_DIR');
    $dir = is_string($configured) && trim($configured) !== '' ? trim($configured) : __DIR__ . DIRECTORY_SEPARATOR . 'storage';

    if (!is_dir($dir)) {
        mkdir($dir, 0750, true);
    }

    return $dir;
}

function client_ip(): string
{
    return clean_text($_SERVER['REMOTE_ADDR'] ?? 'unknown', 80);
}

function enforce_rate_limit(string $storageDir, string $ip): void
{
    $rateDir = $storageDir . DIRECTORY_SEPARATOR . 'rate-limits';
    if (!is_dir($rateDir)) {
        mkdir($rateDir, 0750, true);
    }

    $file = $rateDir . DIRECTORY_SEPARATOR . hash('sha256', $ip) . '.json';
    $now = time();
    $events = [];
    $handle = fopen($file, 'c+');

    if (!$handle) {
        error_log('Contact form rate limit unavailable for ' . hash('sha256', $ip));
        return;
    }

    flock($handle, LOCK_EX);
    $contents = stream_get_contents($handle);
    $decoded = $contents !== false && $contents !== '' ? json_decode($contents, true) : [];

    if (is_array($decoded)) {
        foreach ($decoded as $eventTime) {
            $eventTime = (int) $eventTime;
            if ($eventTime > ($now - RATE_LIMIT_WINDOW_SECONDS)) {
                $events[] = $eventTime;
            }
        }
    }

    if (count($events) >= RATE_LIMIT_MAX_REQUESTS) {
        flock($handle, LOCK_UN);
        fclose($handle);
        send_json(429, ['success' => false, 'message' => 'Too many submissions. Please wait a few minutes and try again.']);
    }

    $events[] = $now;
    ftruncate($handle, 0);
    rewind($handle);
    fwrite($handle, json_encode($events));
    fflush($handle);
    flock($handle, LOCK_UN);
    fclose($handle);
}

function store_lead(string $storageDir, array $lead): bool
{
    $leadFile = $storageDir . DIRECTORY_SEPARATOR . 'leads.jsonl';
    $encoded = json_encode($lead, JSON_UNESCAPED_SLASHES);

    if ($encoded === false) {
        return false;
    }

    $line = $encoded . PHP_EOL;
    $handle = fopen($leadFile, 'ab');
    if (!$handle) {
        return false;
    }

    $stored = false;
    if (flock($handle, LOCK_EX)) {
        $stored = fwrite($handle, $line) !== false;
        fflush($handle);
        flock($handle, LOCK_UN);
    }

    fclose($handle);
    return $stored;
}

function send_lead_email(array $lead): bool
{
    $recipient = getenv('CONTACT_RECIPIENT');
    $recipient = is_string($recipient) && filter_var($recipient, FILTER_VALIDATE_EMAIL) ? $recipient : DEFAULT_RECIPIENT;
    $host = current_host() !== '' ? current_host() : 'uprankdigital.com';
    $from = 'no-reply@' . $host;
    $subject = 'New website inquiry from ' . header_text($lead['name']);
    $serviceText = $lead['services'] ? implode(', ', $lead['services']) : 'Not specified';
    $body = implode("\n", [
        'New inquiry from the Up Rank Digital website',
        '',
        'Lead ID: ' . $lead['id'],
        'Name: ' . $lead['name'],
        'Email: ' . $lead['email'],
        'Phone: ' . $lead['phone'],
        'Business: ' . ($lead['businessName'] !== '' ? $lead['businessName'] : 'Not specified'),
        'Website: ' . ($lead['url'] !== '' ? $lead['url'] : 'Not specified'),
        'Services: ' . $serviceText,
        '',
        'Message:',
        $lead['message'] !== '' ? $lead['message'] : 'Not provided',
        '',
        'Page: ' . ($lead['page'] !== '' ? $lead['page'] : 'Not provided'),
        'Submitted at: ' . $lead['submittedAt'],
        'IP: ' . $lead['ip'],
        'User agent: ' . $lead['userAgent'],
    ]);
    $headers = [
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'From: Up Rank Digital Website <' . $from . '>',
        'Reply-To: ' . header_text($lead['name']) . ' <' . $lead['email'] . '>',
    ];

    return @mail($recipient, $subject, $body, implode("\r\n", $headers));
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_json(405, ['success' => false, 'message' => 'Method not allowed.']);
}

assert_same_origin();

$requestedWith = strtolower((string) ($_SERVER['HTTP_X_REQUESTED_WITH'] ?? ''));
if ($requestedWith !== 'xmlhttprequest') {
    send_json(400, ['success' => false, 'message' => 'Invalid form request. Please refresh the page and try again.']);
}

$contentType = strtolower((string) ($_SERVER['CONTENT_TYPE'] ?? ''));
if ($contentType !== '' && strpos($contentType, 'application/json') === false) {
    send_json(415, ['success' => false, 'message' => 'Invalid form payload.']);
}

$contentLength = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
if ($contentLength > MAX_BODY_BYTES) {
    send_json(413, ['success' => false, 'message' => 'Form payload is too large.']);
}

$rawBody = file_get_contents('php://input') ?: '';
if (strlen($rawBody) > MAX_BODY_BYTES) {
    send_json(413, ['success' => false, 'message' => 'Form payload is too large.']);
}

$data = json_decode($rawBody, true);
if (!is_array($data) || json_last_error() !== JSON_ERROR_NONE) {
    send_json(400, ['success' => false, 'message' => 'Invalid form payload.']);
}

if (clean_text($data['website'] ?? '', 200) !== '') {
    send_json(200, ['success' => true, 'message' => 'Thanks. Your inquiry has been received.']);
}

$name = clean_text($data['name'] ?? '', 120);
$email = normalize_email($data['email'] ?? '');
$phone = normalize_phone($data['phone'] ?? '');
$businessName = clean_text($data['businessName'] ?? '', 160);
$url = normalize_url($data['url'] ?? '');
$message = clean_text($data['message'] ?? '', 3000);
$page = normalize_url($data['page'] ?? '', 500);
$services = $data['services'] ?? [];
$allowedServices = [
    'Digital Services',
    'Performance Marketing',
    'AI Powered Marketing',
    'Conversion Optimization',
    'Analytics & Growth Strategy',
    'Paid Advertising',
    'Content Design',
    'Software Solutions',
];

if (!is_array($services)) {
    $services = [];
}

$services = array_values(array_intersect($allowedServices, array_map(static function ($service): string {
    return clean_text($service, 80);
}, $services)));

if ($name === '' || !$email || $phone === '') {
    send_json(422, ['success' => false, 'message' => 'Please enter a valid name, email, and phone number.']);
}

if (isset($data['url']) && trim((string) $data['url']) !== '' && $url === '') {
    send_json(422, ['success' => false, 'message' => 'Please enter a valid website URL or leave it blank.']);
}

$storageDir = storage_dir();
enforce_rate_limit($storageDir, client_ip());

$lead = [
    'id' => request_id(),
    'submittedAt' => gmdate('c'),
    'name' => $name,
    'email' => $email,
    'phone' => $phone,
    'businessName' => $businessName,
    'url' => $url,
    'services' => array_slice($services, 0, 8),
    'message' => $message,
    'page' => $page,
    'ip' => client_ip(),
    'userAgent' => clean_text($_SERVER['HTTP_USER_AGENT'] ?? '', 500),
];

$stored = store_lead($storageDir, $lead);
$mailSent = send_lead_email($lead);

if (!$mailSent && !$stored) {
    error_log('Contact form delivery failed for lead ' . $lead['id']);
    send_json(500, ['success' => false, 'message' => 'We could not save your inquiry. Please call or WhatsApp us directly.']);
}

send_json(200, [
    'success' => true,
    'message' => 'Thanks. Your inquiry has been received.',
]);
