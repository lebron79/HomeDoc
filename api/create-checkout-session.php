<?php
// Enable CORS for local testing
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

    // Validate required fields
    $amount = $input['amount'] ?? null;
    $email = $input['email'] ?? null;
    $userId = $input['userId'] ?? null;
    $itemName = $input['itemName'] ?? 'Purchase';
    $itemDescription = $input['itemDescription'] ?? '';

    if (!$amount || !$email || !$userId) {
        throw new Exception('Missing required fields: amount, email, userId');
    }

    // Validate amount (must be positive)
    $amount = (int)$amount;
    if ($amount <= 0) {
        throw new Exception('Amount must be greater than 0');
    }

    // Get the origin from request headers or use a default
    $origin = $_SERVER['HTTP_ORIGIN'] ?? 'http://localhost:5173';

    // Create Stripe Checkout Session
    $session = \Stripe\Checkout\Session::create([
        'payment_method_types' => ['card'],
        'line_items' => [
            [
                'price_data' => [
                    'currency' => 'usd',
                    'product_data' => [
                        'name' => $itemName,
                        'description' => $itemDescription ?: 'Payment',
                    ],
                    'unit_amount' => $amount, // Amount in cents
                ],
                'quantity' => 1,
            ]
        ],
        'mode' => 'payment',
        'success_url' => $origin . '/payment-success?session_id={CHECKOUT_SESSION_ID}',
        'cancel_url' => $origin . '/payment-canceled',
        'customer_email' => $email,
        'metadata' => [
            'user_id' => $userId,
            'item_name' => $itemName,
        ],
    ]);

    // Return session ID and redirect URL
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'sessionId' => $session->id,
        'url' => $session->url,
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
