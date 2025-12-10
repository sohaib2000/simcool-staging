<?php

use App\Http\Controllers\Admin\BannerController;
use App\Http\Controllers\Admin\BlogController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\EmailTemplateController;
use App\Http\Controllers\Admin\EsimController;
use App\Http\Controllers\Admin\FaqController;
use App\Http\Controllers\Admin\InAppProductsController;
use App\Http\Controllers\Admin\KycController;
use App\Http\Controllers\Admin\MasterController;
use App\Http\Controllers\Admin\NotificationController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\PageController as AdminPageController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\SupportTicketController;
use App\Http\Controllers\Admin\SystemFlagController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Frontend\HomeController;
use App\Http\Controllers\Frontend\PageController;
use App\Http\Controllers\InstallerController;
use App\Http\Controllers\MasterController as ControllersMasterController;

require __DIR__ . '/auth.php';

Route::get('/api/csrf-token', function () {
    return response()->json(['csrf_token' => csrf_token()]);
});

Route::get('/admin/login', [LoginController::class, 'login'])->name('admin.login');
Route::get('/admin',function () {
	   return redirect()->route('admin.login');
});
Route::get('/',function () {
	   return redirect()->route('admin.login');
});
Route::middleware(['admincheck'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'dashboard'])->name('dashboard');
    Route::match(['GET', 'POST'], '/profile', [DashboardController::class, 'profile'])->name('profile');

    Route::prefix('users')->name('user.')->group(function () {
        Route::get('/', [UserController::class, 'index'])->name('index');
        Route::get('/details/{id}', [UserController::class, 'details'])->name('details');
        Route::post('/add-wallet-amount', [UserController::class, 'AddWalletAmount'])->name('addWalletAmount');

        Route::get('/kyc/index/{status}', [KycController::class, 'index'])->name('kyc.index');
        Route::post('/kyc/approval', [KycController::class, 'kycApproval'])->name('kyc.approval');
    });
    Route::prefix('masters')->group(function () {
        Route::get('/regions', [MasterController::class, 'regions'])->name('regions');
        Route::get('/countries', [MasterController::class, 'countries'])->name('countries');
        Route::get('/operators', [MasterController::class, 'operators'])->name('operators');
        Route::get('/packages', [MasterController::class, 'packages'])->name('packages');
        Route::post('/package/update', [MasterController::class, 'packageUpdate'])->name('package.update');
        Route::get('/currencies', [MasterController::class, 'currencies'])->name('currencies');
        Route::post('/currencies/update-points/{id}', [MasterController::class, 'updatePoints'])->name('currencies.update-points');
        Route::post('/currencies/update-currency/{id}', [MasterController::class, 'updateCurrencyEqual'])->name('currencies.update-currency');

        Route::get('/get-packages', [MasterController::class, 'getPackagesByAjax'])->name('get.packages.ajax');
        //Sync Data
        Route::get('/sync-from-airalo', [MasterController::class, 'syncFromAiralo'])->name('syncAiralo');
        Route::get('/sync-from-esimaccess', [MasterController::class, 'syncFromEsimAccess'])->name('syncEsimaccess');
        Route::get('/sync-from-esimgo', [MasterController::class, 'syncFromEsimGo'])->name('syncEsimgo');
        Route::get('/sync-to-google', [MasterController::class, 'syncToGoogle'])->name('syncGoogle');
        Route::get('/sync-to-apple', [MasterController::class, 'syncToApple'])->name('syncApple');
    });
    Route::prefix('reports')->group(function () {
        Route::get('/sale', [ReportController::class, 'sale'])->name('report.sale');
        Route::get('/analytics', [ReportController::class, 'analytics'])->name('report.analytics');
        Route::get('/sale/export', [ReportController::class, 'exportSaleReport'])->name('report.sale.export');
        Route::get('/packages', [ReportController::class, 'PackageSaleReport'])->name('report.packages');
    });
    Route::prefix('orders')->group(function () {
        Route::get('/', [OrderController::class, 'index'])->name('orders');
        Route::get('/details/{id}', [OrderController::class, 'details'])->name('orders.details');
        Route::get('/export', [OrderController::class, 'exportOrder'])->name('orders.export');
    });
    Route::prefix('esims')->group(function () {
        Route::get('/', [EsimController::class, 'index'])->name('esims');
        Route::get('/{sim}/usage', [EsimController::class, 'getUsage'])->name('esims.usage');
    });

    Route::post('/updateSystemflag', [SystemFlagController::class, 'editSystemFlag'])->name('updateSystemflag');
    Route::get('/settings', [SystemFlagController::class, 'getSystemFlag'])->name('settings');

    //Blogs
    Route::resource('blogs', BlogController::class);
    //Pages
    Route::resource('pages', AdminPageController::class);
    //Banners
    Route::resource('banners', BannerController::class);
    Route::post('/banners/status-update', [BannerController::class, 'statusUpdate'])->name('banners.status.update');

    //Notification
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index'])->name('notification.index');
        Route::get('/readupdate', [NotificationController::class, 'readUpdate'])->name('notification.read.update');
    });
    Route::prefix('master-notifications')->name('notification.master.')->group(function () {
        Route::get('/', [NotificationController::class, 'masterNotification'])->name('index');
        Route::post('/store', [NotificationController::class, 'store'])->name('store');
        Route::post('/update/{id}', [NotificationController::class, 'update'])->name('update');
        Route::post('/send/{id}', [NotificationController::class, 'sendNotification'])->name('sendNoti');
        Route::delete('/destroy/{notification}', [NotificationController::class, 'destroy'])->name('delete');
    });
    Route::prefix('tickets')->name('tickets.')->group(function () {
        Route::get('/', [SupportTicketController::class, 'index'])->name('index');
        Route::get('/{ticket}', [SupportTicketController::class, 'show'])->name('show');
        Route::post('/{ticket}/reply', [SupportTicketController::class, 'reply'])->name('reply');
        Route::post('/{ticket}/close', [SupportTicketController::class, 'close'])->name('close');
        Route::post('/toggle', [SupportTicketController::class, 'toggle'])->name('toggle');
    });

    Route::resource('faqs', FaqController::class)->except(['show', 'create', 'edit']);
    Route::post('faqs/status/update', [FaqController::class, 'statusUpdate'])->name('faqs.status.update');

    Route::prefix('iap')->name('iap.')->group(function () {
        Route::get('/', [InAppProductsController::class, 'index'])->name('index');
        Route::post('/store', [InAppProductsController::class, 'store'])->name('store');
        Route::get('/destroy', [InAppProductsController::class, 'deleteProduct'])->name('destroy');
    });

    //Email Templates
    Route::resource('email-templates', EmailTemplateController::class)->except(['show', 'create', 'edit']);
});

//Website Routes
Route::get('/web', [HomeController::class, 'home'])->name('admin.web');

Route::get('/{slug}', [PageController::class, 'pages'])->name('pages');
Route::match(['GET','POST'],'/contact/support', [PageController::class, 'contactUs'])->name('contactUs');
Route::get('/search/countries', [HomeController::class, 'search'])->name('search.countries');

