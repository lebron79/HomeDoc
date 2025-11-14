<?php
// Enable CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Load Stripe SDK
require_once __DIR__ . '/../vendor/autoload.php';

// Get your Stripe secret key from environment
$stripe_secret_key = getenv('STRIPE_SECRET_KEY');

if (!$stripe_secret_key) {
    http_response_code(500);
    echo json_encode(['error' => 'Stripe key not configured']);
    exit;
}

\Stripe\Stripe::setApiKey($stripe_secret_key);

try {
    // Get JSON body
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Invalid JSON input');
    }

    // Get session ID
    $sessionId = $input['sessionId'] ?? null;

    if (!$sessionId) {
        throw new Exception('Missing sessionId');
    }

    // Retrieve the session from Stripe
    $session = \Stripe\Checkout\Session::retrieve($sessionId);

    // Check if payment was successful
    if ($session->payment_status !== 'paid') {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Payment not completed',
            'status' => $session->payment_status,
        ]);
        exit;
    }

    // Get payment details
    $paymentIntentId = $session->payment_intent;
    $amount = $session->amount_total;
    $email = $session->customer_email;
    $userId = $session->metadata->user_id ?? null;
    $itemName = $session->metadata->item_name ?? 'Purchase';

    // Return verified payment details
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'verified' => true,
        'sessionId' => $sessionId,
        'paymentIntentId' => $paymentIntentId,
        'amount' => $amount,
        'email' => $email,
        'userId' => $userId,
        'itemName' => $itemName,
        'status' => $session->payment_status,
        'created' => $session->created,
    ]);

} catch (\Stripe\Exception\ApiErrorException $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'type' => 'stripe_error',
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
    ]);
}
?>
