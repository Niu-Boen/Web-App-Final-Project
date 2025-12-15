<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\MenuItem;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class StatisticsController extends Controller
{
    // In Laravel 11+, middleware is applied via routes, not in constructor

    // Get user's own consumption statistics
    public function getUserConsumptionStats(Request $request)
    {
        $user = $request->user();
        $userId = $user->id;

        // Most ordered items
        $mostOrdered = OrderItem::select('menu_items.name as item_name')
            ->selectRaw('categories.name as category_name')
            ->selectRaw('SUM(order_items.quantity) as total_quantity')
            ->selectRaw('SUM(order_items.total_price) as total_spent')
            ->join('menu_items', 'order_items.menu_item_id', '=', 'menu_items.id')
            ->join('categories', 'menu_items.category_id', '=', 'categories.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.user_id', $userId)
            ->where('orders.payment_status', 'paid')
            ->groupBy('menu_items.id', 'menu_items.name', 'categories.name')
            ->orderBy('total_quantity', 'desc')
            ->limit(10)
            ->get();

        // Spending by category
        $spendingByCategory = Category::select('categories.name as category_name')
            ->selectRaw('SUM(order_items.total_price) as total_spent')
            ->selectRaw('COUNT(DISTINCT orders.id) as order_count')
            ->join('menu_items', 'categories.id', '=', 'menu_items.category_id')
            ->join('order_items', 'menu_items.id', '=', 'order_items.menu_item_id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.user_id', $userId)
            ->where('orders.payment_status', 'paid')
            ->groupBy('categories.id', 'categories.name')
            ->orderBy('total_spent', 'desc')
            ->get();

        // Monthly spending (last 12 months) - SQLite compatible
        $monthlySpending = Order::selectRaw("strftime('%Y', created_at) as year")
            ->selectRaw("strftime('%m', created_at) as month")
            ->selectRaw('SUM(total_amount) as total_spent')
            ->selectRaw('COUNT(*) as order_count')
            ->where('user_id', $userId)
            ->where('payment_status', 'paid')
            ->where('created_at', '>=', Carbon::now()->subMonths(12))
            ->groupBy('year', 'month')
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->get()
            ->map(function($item) {
                return [
                    'month' => Carbon::create($item->year, $item->month)->format('M Y'),
                    'total_spent' => $item->total_spent,
                    'order_count' => $item->order_count
                ];
            });

        // Liked items
        $likedItems = $user->likedMenuItems()
            ->with(['category'])
            ->withCount('likes')
            ->get();

        // Overall statistics
        $totalSpent = $user->orders()->where('payment_status', 'paid')->sum('total_amount');
        $totalOrders = $user->orders()->where('payment_status', 'paid')->count();
        $averageOrderValue = $totalOrders > 0 ? $totalSpent / $totalOrders : 0;

        // Favorite time of day for ordering - SQLite compatible
        $favoriteTime = Order::where('user_id', $userId)
            ->where('payment_status', 'paid')
            ->selectRaw("strftime('%H', created_at) as hour, COUNT(*) as count")
            ->groupBy('hour')
            ->orderBy('count', 'desc')
            ->first();

        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user->only(['id', 'name', 'student_id', 'account_balance']),
                'most_ordered' => $mostOrdered,
                'spending_by_category' => $spendingByCategory,
                'monthly_spending' => $monthlySpending,
                'liked_items' => $likedItems,
                'summary' => [
                    'total_spent' => $totalSpent,
                    'total_orders' => $totalOrders,
                    'average_order_value' => round($averageOrderValue, 2),
                    'favorite_ordering_time' => $favoriteTime ? $favoriteTime->hour . ':00' : null
                ]
            ]
        ]);
    }

    // Get user's order history
    public function getUserOrderHistory(Request $request)
    {
        $user = $request->user();
        
        $query = Order::with(['orderItems.menuItem', 'user'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        if ($request->has('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        $orders = $query->paginate($request->get('per_page', 10));

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }

    // Get consumption trends comparison (user vs average)
    public function getConsumptionComparison(Request $request)
    {
        $user = $request->user();
        $userId = $user->id;

        // User's monthly spending - SQLite compatible
        $userMonthlySpending = Order::where('user_id', $userId)
            ->where('payment_status', 'paid')
            ->where('created_at', '>=', Carbon::now()->subMonths(6))
            ->selectRaw("strftime('%Y', created_at) as year, strftime('%m', created_at) as month, SUM(total_amount) as total")
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get();

        // Average monthly spending of all users - SQLite compatible
        $averageMonthlySpending = Order::where('payment_status', 'paid')
            ->where('created_at', '>=', Carbon::now()->subMonths(6))
            ->selectRaw("strftime('%Y', created_at) as year, strftime('%m', created_at) as month, AVG(total_amount) as average")
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'user_spending' => $userMonthlySpending,
                'average_spending' => $averageMonthlySpending
            ]
        ]);
    }
}