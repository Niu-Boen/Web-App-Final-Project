<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TrustedFriend;
use App\Models\User;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class TrustedFriendController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    // Get user's trusted friends
    public function index()
    {
        $trustedFriends = auth()->user()->trustedFriends()
            ->with(['friend' => function($query) {
                $query->select('id', 'student_id', 'name', 'email', 'avatar', 'account_balance', 'is_active');
            }])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $trustedFriends
        ]);
    }

    // Add a trusted friend
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'friend_student_id' => 'required|string|exists:users,student_id',
            'permission_type' => 'required|in:permanent,temporary',
            'expires_at' => 'nullable|date|after:now',
            'usage_limit' => 'nullable|integer|min:1'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Custom validation for time limits
        if ($request->permission_type === 'temporary') {
            if (!$request->expires_at) {
                return response()->json([
                    'success' => false,
                    'message' => 'Expiration date is required for temporary permissions'
                ], 422);
            }
            
            $expiresAt = Carbon::parse($request->expires_at);
            $maxTempDate = Carbon::now()->addWeeks(2);
            
            if ($expiresAt->gt($maxTempDate)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Temporary permissions cannot exceed 2 weeks'
                ], 422);
            }
        }

        if ($request->permission_type === 'permanent' && $request->expires_at) {
            $expiresAt = Carbon::parse($request->expires_at);
            $maxPermDate = Carbon::now()->addYears(5);
            
            if ($expiresAt->gt($maxPermDate)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Permanent permissions cannot exceed 5 years'
                ], 422);
            }
        }

        $friend = User::where('student_id', $request->friend_student_id)->first();
        
        if ($friend->id === auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot add yourself as a trusted friend'
            ], 400);
        }

        // Check if already exists
        $existing = TrustedFriend::where('user_id', auth()->id())
            ->where('friend_id', $friend->id)
            ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'This user is already in your trusted friends list'
            ], 400);
        }

        $trustedFriend = TrustedFriend::create([
            'user_id' => auth()->id(),
            'friend_id' => $friend->id,
            'permission_type' => $request->permission_type,
            'expires_at' => $request->expires_at,
            'usage_limit' => $request->usage_limit,
            'is_active' => true
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Trusted friend added successfully',
            'data' => $trustedFriend->load('friend')
        ]);
    }

    // Update trusted friend permissions
    public function update(Request $request, $id)
    {
        $trustedFriend = TrustedFriend::where('user_id', auth()->id())
            ->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'permission_type' => 'sometimes|in:permanent,temporary',
            'expires_at' => 'nullable|date|after:now',
            'usage_limit' => 'nullable|integer|min:1',
            'is_active' => 'sometimes|boolean'
        ]);

        // Custom validation for time limits when updating
        if ($request->has('permission_type') && $request->has('expires_at') && $request->expires_at) {
            $permissionType = $request->permission_type ?? $trustedFriend->permission_type;
            
            if ($permissionType === 'temporary') {
                $expiresAt = Carbon::parse($request->expires_at);
                $maxTempDate = Carbon::now()->addWeeks(2);
                
                if ($expiresAt->gt($maxTempDate)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Temporary permissions cannot exceed 2 weeks'
                    ], 422);
                }
            }

            if ($permissionType === 'permanent') {
                $expiresAt = Carbon::parse($request->expires_at);
                $maxPermDate = Carbon::now()->addYears(5);
                
                if ($expiresAt->gt($maxPermDate)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Permanent permissions cannot exceed 5 years'
                    ], 422);
                }
            }
        }

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $trustedFriend->update($request->only([
            'permission_type',
            'expires_at',
            'usage_limit',
            'is_active'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Trusted friend updated successfully',
            'data' => $trustedFriend->load('friend')
        ]);
    }

    // Remove trusted friend
    public function destroy($id)
    {
        $trustedFriend = TrustedFriend::where('user_id', auth()->id())
            ->findOrFail($id);

        $trustedFriend->delete();

        return response()->json([
            'success' => true,
            'message' => 'Trusted friend removed successfully'
        ]);
    }

    // Get orders that can be picked up by current user (as a trusted friend)
    public function getPickupOrders()
    {
        $user = auth()->user();
        
        // Get all users who trust this user
        $trustedRelationships = TrustedFriend::valid()
            ->where('friend_id', $user->id)
            ->with('user')
            ->get();

        $userIds = $trustedRelationships->pluck('user_id');

        $orders = Order::whereIn('user_id', $userIds)
            ->where('status', 'ready')
            ->with(['user', 'order_items.menu_item'])
            ->orderBy('ready_at', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'orders' => $orders,
                'trusted_relationships' => $trustedRelationships
            ]
        ]);
    }

    // Pickup order on behalf of someone
    public function pickupOrder(Request $request, $orderId)
    {
        $validator = Validator::make($request->all(), [
            'pickup_code' => 'sometimes|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $order = Order::findOrFail($orderId);
        $currentUser = auth()->user();

        // Check if current user is trusted by the order owner
        $trustedRelationship = TrustedFriend::valid()
            ->where('user_id', $order->user_id)
            ->where('friend_id', $currentUser->id)
            ->first();

        if (!$trustedRelationship) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to pick up this order'
            ], 403);
        }

        if ($order->status !== 'ready') {
            return response()->json([
                'success' => false,
                'message' => 'Order is not ready for pickup'
            ], 400);
        }

        // Update order status
        $order->update([
            'status' => 'completed',
            'completed_at' => Carbon::now(),
            'pickup_person_name' => $currentUser->name,
            'pickup_person_id' => $currentUser->student_id
        ]);

        // Increment usage count for the trusted relationship
        $trustedRelationship->incrementUsage();

        return response()->json([
            'success' => true,
            'message' => 'Order picked up successfully',
            'data' => $order->load(['user', 'order_items.menu_item'])
        ]);
    }

    // Search users to add as trusted friends
    public function searchUsers(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'search' => 'required|string|min:2'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $search = $request->search;
        $currentUserId = auth()->id();

        $users = User::where('id', '!=', $currentUserId)
            ->where('is_active', true)
            ->where(function($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('student_id', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
            })
            ->select('id', 'student_id', 'name', 'email', 'avatar', 'account_balance')
            ->orderBy('student_id')
            ->orderBy('name')
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }
}