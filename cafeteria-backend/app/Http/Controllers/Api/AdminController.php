<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AdminController extends Controller
{
    // In Laravel 11+, middleware is applied via routes, not in constructor

    // User Management - Admin can only manage user ID, password, and status
    public function getAllUsers(Request $request)
    {
        $query = User::select('id', 'student_id', 'name', 'email', 'role', 'gender', 'is_active', 'created_at', 'updated_at');
        
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

    // Reset user password (admin can change but not view)
    public function resetUserPassword(Request $request, $userId)
    {
        $validator = Validator::make($request->all(), [
            'password' => 'required|string|min:6',
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
        
        $user->update([
            'password' => Hash::make($request->password)
        ]);

        // Revoke all user tokens to force re-login
        $user->tokens()->delete();

        // Log the activity
        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'password_reset_by_admin',
            'description' => 'Password reset by admin: ' . $request->reason,
            'performed_by' => auth()->id()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User password reset successfully'
        ]);
    }

    // Update user information (student_id, name, email)
    public function updateUserInfo(Request $request, $userId)
    {
        $user = User::findOrFail($userId);
        
        $validator = Validator::make($request->all(), [
            'student_id' => 'sometimes|string|unique:users,student_id,' . $userId,
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $userId,
            'reason' => 'required|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $oldValues = [];
        $newValues = [];
        
        if ($request->has('student_id') && $request->student_id !== $user->student_id) {
            $oldValues['student_id'] = $user->student_id;
            $newValues['student_id'] = $request->student_id;
            $user->student_id = $request->student_id;
        }
        
        if ($request->has('name') && $request->name !== $user->name) {
            $oldValues['name'] = $user->name;
            $newValues['name'] = $request->name;
            $user->name = $request->name;
        }
        
        if ($request->has('email') && $request->email !== $user->email) {
            $oldValues['email'] = $user->email;
            $newValues['email'] = $request->email;
            $user->email = $request->email;
        }

        if (empty($newValues)) {
            return response()->json([
                'success' => false,
                'message' => 'No changes detected'
            ], 400);
        }

        $user->save();

        // Log the activity
        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'user_info_updated_by_admin',
            'description' => 'User information updated by admin: ' . $request->reason,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'performed_by' => auth()->id()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User information updated successfully',
            'data' => $user->fresh()
        ]);
    }

    // Update user role
    public function updateUserRole(Request $request, $userId)
    {
        $validator = Validator::make($request->all(), [
            'role' => 'required|in:admin,staff,student,finance',
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
        $oldRole = $user->role;
        
        $user->update([
            'role' => $request->role
        ]);

        // Log the activity
        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'role_updated_by_admin',
            'description' => 'User role changed by admin: ' . $request->reason,
            'old_values' => ['role' => $oldRole],
            'new_values' => ['role' => $request->role],
            'performed_by' => auth()->id()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User role updated successfully',
            'data' => $user->fresh()
        ]);
    }



    // Update user status (active/inactive)
    public function updateUserStatus(Request $request, $userId)
    {
        $validator = Validator::make($request->all(), [
            'is_active' => 'required|boolean',
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
        $oldStatus = $user->is_active;
        
        $user->update([
            'is_active' => $request->is_active
        ]);

        // If deactivating user, revoke all tokens
        if (!$request->is_active) {
            $user->tokens()->delete();
        }

        // Log the activity
        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'status_updated',
            'description' => 'User status changed by admin: ' . $request->reason,
            'old_values' => ['is_active' => $oldStatus],
            'new_values' => ['is_active' => $request->is_active],
            'performed_by' => auth()->id()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User status updated successfully',
            'data' => $user->fresh()
        ]);
    }

    // Get activity logs
    public function getActivityLogs(Request $request)
    {
        $query = ActivityLog::with(['user:id,name,student_id', 'performedBy:id,name,student_id'])
            ->orderBy('created_at', 'desc');

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('action')) {
            $query->where('action', $request->action);
        }

        $logs = $query->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $logs
        ]);
    }

    // Get dashboard statistics
    public function getDashboardStats()
    {
        $totalUsers = User::count();
        $activeUsers = User::where('is_active', true)->count();
        $totalOrders = \App\Models\Order::count();
        $totalRevenue = \App\Models\Order::where('status', 'completed')->sum('total_amount');

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => [
                    'total_users' => $totalUsers,
                    'active_users' => $activeUsers,
                    'total_orders' => $totalOrders,
                    'total_revenue' => $totalRevenue
                ]
            ]
        ]);
    }
}