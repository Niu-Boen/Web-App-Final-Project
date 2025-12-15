<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\FinanceController;
use App\Http\Controllers\Api\StatisticsController;
use App\Http\Controllers\Api\TrustedFriendController;
use App\Http\Controllers\Api\MenuItemLikeController;
use App\Http\Controllers\Api\MenuItemReviewController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public menu routes
Route::get('/categories', [MenuController::class, 'categories']);
Route::get('/menu', [MenuController::class, 'index']);
Route::get('/menu/{id}', [MenuController::class, 'show']);
Route::get('/menu-items/{id}/stats', [MenuController::class, 'getItemStats']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
    Route::post('/enable-2fa', [AuthController::class, 'enable2FA']);
    Route::post('/disable-2fa', [AuthController::class, 'disable2FA']);
    Route::post('/verify-2fa', [AuthController::class, 'verify2FA']);
    
    // User routes
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    
    // Order routes
    Route::apiResource('orders', OrderController::class);
    Route::post('/orders/{id}/confirm', [OrderController::class, 'confirm']);
    Route::post('/orders/{id}/cancel', [OrderController::class, 'cancel']);
    Route::post('/orders/{id}/pickup', [OrderController::class, 'pickup']);
    
    // File upload routes
    Route::post('/upload/avatar', [App\Http\Controllers\Api\FileUploadController::class, 'uploadAvatar']);
    Route::post('/upload/menu-item-image', [App\Http\Controllers\Api\FileUploadController::class, 'uploadMenuItemImage']);
    Route::delete('/upload/file', [App\Http\Controllers\Api\FileUploadController::class, 'deleteFile']);
    
    // Menu item likes routes
    Route::post('/menu-items/{menuItemId}/like', [MenuItemLikeController::class, 'toggle']);
    Route::get('/menu-items/liked', [MenuItemLikeController::class, 'getUserLikes']);
    Route::get('/menu-items/popular', [MenuItemLikeController::class, 'getPopular']);
    
    // Menu item reviews routes
    Route::get('/menu-items/{menuItemId}/reviews', [MenuItemReviewController::class, 'index']);
    Route::post('/menu-items/{menuItemId}/reviews', [MenuItemReviewController::class, 'store']);
    Route::put('/menu-items/{menuItemId}/reviews/{reviewId}', [MenuItemReviewController::class, 'update']);
    Route::delete('/menu-items/{menuItemId}/reviews/{reviewId}', [MenuItemReviewController::class, 'destroy']);
    Route::get('/menu-items/{menuItemId}/user-review', [MenuItemReviewController::class, 'getUserReview']);
    Route::get('/menu-items/{menuItemId}/user-orders', [MenuItemReviewController::class, 'getUserOrdersForItem']);
    
    // Trusted Friends routes (for proxy pickup)
    Route::prefix('trusted-friends')->group(function () {
        Route::get('/', [TrustedFriendController::class, 'index']);
        Route::post('/', [TrustedFriendController::class, 'store']);
        Route::put('/{id}', [TrustedFriendController::class, 'update']);
        Route::delete('/{id}', [TrustedFriendController::class, 'destroy']);
        Route::get('/pickup-orders', [TrustedFriendController::class, 'getPickupOrders']);
        Route::post('/pickup/{orderId}', [TrustedFriendController::class, 'pickupOrder']);
        Route::get('/search-users', [TrustedFriendController::class, 'searchUsers']);
    });

    // Staff only routes - Menu management and order management
    Route::middleware('role:staff')->group(function () {
        Route::get('/orders/all', [OrderController::class, 'all']);
        Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']);
        Route::apiResource('menu', MenuController::class)->except(['index', 'show']);
    });

    // Admin only routes - User management
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/users', [AdminController::class, 'getAllUsers']);
        Route::put('/users/{userId}/status', [AdminController::class, 'updateUserStatus']);
        Route::put('/users/{userId}/password', [AdminController::class, 'resetUserPassword']);
        Route::put('/users/{userId}/info', [AdminController::class, 'updateUserInfo']);
        Route::put('/users/{userId}/role', [AdminController::class, 'updateUserRole']);
        Route::get('/dashboard-stats', [AdminController::class, 'getDashboardStats']);
        Route::get('/activity-logs', [AdminController::class, 'getActivityLogs']);
    });

    // Finance manager only routes - Financial management
    Route::middleware('role:finance')->prefix('finance')->group(function () {
        Route::get('/users', [FinanceController::class, 'getAllUsers']);
        Route::put('/users/{userId}/balance', [FinanceController::class, 'updateUserBalance']);
        Route::get('/financial-report', [FinanceController::class, 'getFinancialReport']);
        Route::get('/balance-history/{userId?}', [FinanceController::class, 'getBalanceHistory']);
    });

    // Statistics routes - All users can view their own statistics
    Route::prefix('statistics')->group(function () {
        Route::get('/consumption', [StatisticsController::class, 'getUserConsumptionStats']);
        Route::get('/orders', [StatisticsController::class, 'getUserOrderHistory']);
        Route::get('/comparison', [StatisticsController::class, 'getConsumptionComparison']);
    });

    // Likes statistics (accessible to all authenticated users)
    Route::get('/likes-statistics', [MenuItemLikeController::class, 'getStatistics']);
});
