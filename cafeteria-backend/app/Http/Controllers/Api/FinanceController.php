<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Order;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class FinanceController extends Controller
{
    // In Laravel 11+, middleware is applied via routes, not in constructor
    // Finance role checking is handled by route middleware

    // Get all users with balance information
    public function getAllUsers(Request $request)
    {
        $query = User::select('id', 'student_id', 'name', 'email', 'role', 'gender', 'account_balance', 'is_active', 'created_at');
        
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('student_id', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        $users = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    // Update user balance - Finance manager only
    public function updateUserBalance(Request $request, $userId)
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:0',
            'operation' => 'required|in:add,subtract,set',
            'reason' => 'required|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::findOrFail($userId);
        $oldBalance = $user->account_balance;
        $amount = $request->amount;
        $operation = $request->operation;

        switch ($operation) {
            case 'add':
                $user->increment('account_balance', $amount);
                break;
            case 'subtract':
                if ($user->account_balance < $amount) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Insufficient balance'
                    ], 400);
                }
                $user->decrement('account_balance', $amount);
                break;
            case 'set':
                $user->update(['account_balance' => $amount]);
                break;
        }

        $newBalance = $user->fresh()->account_balance;

        // Log the activity
        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'balance_updated',
            'description' => "Balance {$operation} by finance manager: {$request->reason}",
            'old_values' => ['account_balance' => $oldBalance],
            'new_values' => ['account_balance' => $newBalance],
            'performed_by' => auth()->id()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User balance updated successfully',
            'data' => [
                'user' => $user->fresh(),
                'old_balance' => $oldBalance,
                'new_balance' => $newBalance
            ]
        ]);
    }

    // Get financial report
    public function getFinancialReport(Request $request)
    {
        $startDate = $request->get('start_date', Carbon::now()->startOfMonth());
        $endDate = $request->get('end_date', Carbon::now()->endOfMonth());

        // Total revenue from completed orders
        $totalRevenue = Order::where('payment_status', 'paid')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->sum('total_amount');

        // Total orders
        $totalOrders = Order::whereBetween('created_at', [$startDate, $endDate])->count();
        $completedOrders = Order::where('status', 'completed')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        // Daily revenue
        $dailyRevenue = Order::where('payment_status', 'paid')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('DATE(created_at) as date, SUM(total_amount) as revenue')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Top spending users
        $topSpenders = User::select('users.id', 'users.name', 'users.student_id')
            ->selectRaw('SUM(orders.total_amount) as total_spent')
            ->join('orders', 'users.id', '=', 'orders.user_id')
            ->where('orders.payment_status', 'paid')
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->groupBy('users.id', 'users.name', 'users.student_id')
            ->orderBy('total_spent', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'total_revenue' => $totalRevenue,
                'total_orders' => $totalOrders,
                'completed_orders' => $completedOrders,
                'completion_rate' => $totalOrders > 0 ? ($completedOrders / $totalOrders) * 100 : 0,
                'daily_revenue' => $dailyRevenue,
                'top_spenders' => $topSpenders,
                'period' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate
                ]
            ]
        ]);
    }

    // Get balance change history
    public function getBalanceHistory(Request $request, $userId = null)
    {
        $query = ActivityLog::where('action', 'balance_updated')
            ->with(['user:id,name,student_id', 'performedBy:id,name,student_id'])
            ->orderBy('created_at', 'desc');

        if ($userId) {
            $query->where('user_id', $userId);
        }

        $history = $query->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $history
        ]);
    }
}