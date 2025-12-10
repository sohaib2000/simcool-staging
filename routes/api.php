<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\KycController;
use App\Http\Controllers\Admin\KycController as AdminKycController;
use App\Http\Controllers\EsimPackageController;
use App\Http\Controllers\EsimOrderController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\MasterController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\SupportTicketApiController;
use App\Http\Controllers\TopUpController;
use App\Http\Controllers\WebhookController;

// ----------- PUBLIC ROUTES (NO AUTH REQUIRED) -----------
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);


Route::post('/loginWithOtp', [AuthController::class, 'requestLoginOtp']);
Route::post('/verifyEmailOtp', [AuthController::class, 'verifyLoginOtp']);

Route::get('/packages', [EsimPackageController::class, 'index']);
Route::get('/packages/{id}', [EsimPackageController::class, 'show']);
Route::get('/currency', [MasterController::class, 'currencies']);

//pages
Route::get('pages', [MasterController::class, 'pages']);
Route::get('/blogs', [MasterController::class, 'blogs']);
Route::get('/banners', [MasterController::class, 'banners']);
Route::get('/deviceCompatible', [MasterController::class, 'deviceCompatibleEsim']);
Route::get('/test-noti', [MasterController::class, 'TestNoti']);
Route::get('/test-cache', [MasterController::class, 'testCache']);

Route::get('/generalSettings', [MasterController::class, 'generalSettings']);

// ----------- PROTECTED ROUTES (AUTH REQUIRED) -----------
Route::middleware(['auth:sanctum'])->group(function () {
    // User Profile
    Route::match(['GET', 'POST'], '/profile', [AuthController::class, 'profile']);
    Route::post('/signout', [AuthController::class, 'destroy']);
    Route::get('/deleteAccount', [AuthController::class, 'deleteAccount']);

    // KYC APIs
    Route::get('/kyc/status', [KycController::class, 'status']);
    Route::apiResource('kyc', KycController::class);

    // eSIM Order APIs
    Route::apiResource('orders', EsimOrderController::class)->only(['index', 'store', 'show', 'update']);
    Route::get('orders/{id}/status', [EsimOrderController::class, 'status']);
    Route::post('orders/{id}/activate', [EsimOrderController::class, 'activate']);
    Route::post('async/orders', [EsimOrderController::class, 'asyncOrder']);
    Route::get('myEsims', [EsimOrderController::class, 'myEsims']);

    //Package Top
    Route::get('getTopupList', [TopUpController::class, 'topuplist']);
    Route::post('topupStore', [TopUpController::class, 'topupStore']);

    //Get Usages
    Route::get('getUsage', [HomeController::class, 'getUsage']);
    Route::get('instructions', [HomeController::class, 'esimInstruction']);

    //Payment
    Route::get('payment/gateways', [PaymentController::class, 'paymentGatewayList']);
    Route::post('payment/initiate', [PaymentController::class, 'initiatePayment']);
    Route::post('payment/verifyPayment', [PaymentController::class, 'verifyRazorpayPayment']);
    Route::post('payment/cancel', [PaymentController::class, 'cancelPayment']);

    //Notification
    Route::get('notifications', [HomeController::class, 'notifications']);

    //Tickets
    Route::post('/tickets', [SupportTicketApiController::class, 'store']);
    Route::post('/tickets/{ticket}/messages', [SupportTicketApiController::class, 'addMessage']);
    Route::get('/tickets', [SupportTicketApiController::class, 'index']);
    Route::get('/tickets/{ticket}', [SupportTicketApiController::class, 'show']);

});
//Masters API
Route::get('/country', [MasterController::class, 'countries']);
Route::get('/regions', [MasterController::class, 'regions']);
//Faqs
Route::get('/faqs', [SupportTicketApiController::class, 'faqs']);
Route::match(['GET', 'POST'], 'webhook/orders', [WebhookController::class, 'orderDetails'])->name('async.order');
Route::match(['GET', 'POST'], 'webhook/getLowData', [WebhookController::class, 'getLowData']);

Route::post('/cashfree/webhook', [PaymentController::class, 'webhook'])->name('cashfree.webhook');
Route::get('/cashfree/callback', [PaymentController::class, 'callback'])->name('cashfree.callback');
