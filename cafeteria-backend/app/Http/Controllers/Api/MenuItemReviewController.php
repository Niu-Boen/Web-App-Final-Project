<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MenuItemReview;
use App\Models\MenuItem;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MenuItemReviewController extends Controller
{
    // In Laravel 11+, middleware is applied via routes, not in constructor

    // Get reviews for a menu item
    public function index($menuItemId)
    {
        $menuItem = MenuItem::findOrFail($menuItemId);
        
        $reviews = MenuItemReview::where('menu_item_id', $menuItemId)
            ->with(['user:id,name,avatar'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $reviews
        ]);
    }

    // Create a review for a menu item
    public function store(Request $request, $menuItemId)
    {
        $validator = Validator::make($request->all(), [
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
            'order_id' => 'nullable|exists:orders,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $menuItem = MenuItem::findOrFail($menuItemId);
        $user = auth()->user();

        // Check if user has already reviewed this item
        $existingReview = MenuItemReview::where('user_id', $user->id)
            ->where('menu_item_id', $menuItemId)
            ->first();

        if ($existingReview) {
            return response()->json([
                'success' => false,
                'message' => 'You have already reviewed this item'
            ], 400);
        }

        // If order_id is provided, verify the user has ordered this item
        if ($request->order_id) {
            $order = Order::where('id', $request->order_id)
                ->where('user_id', $user->id)
                ->where('status', 'completed')
                ->whereHas('order_items', function($query) use ($menuItemId) {
                    $query->where('menu_item_id', $menuItemId);
                })
                ->first();

            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'You can only review items you have ordered and received'
                ], 400);
            }
        }

        $review = MenuItemReview::create([
            'user_id' => $user->id,
            'menu_item_id' => $menuItemId,
            'order_id' => $request->order_id,
            'rating' => $request->rating,
            'comment' => $request->comment
        ]);

        // Update menu item average rating
        $this->updateMenuItemRating($menuItemId);

        return response()->json([
            'success' => true,
            'message' => 'Review added successfully',
            'data' => $review->load('user:id,name,avatar')
        ]);
    }

    // Update a review
    public function update(Request $request, $menuItemId, $reviewId)
    {
        $validator = Validator::make($request->all(), [
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $review = MenuItemReview::where('id', $reviewId)
            ->where('user_id', auth()->id())
            ->where('menu_item_id', $menuItemId)
            ->firstOrFail();

        $review->update([
            'rating' => $request->rating,
            'comment' => $request->comment
        ]);

        // Update menu item average rating
        $this->updateMenuItemRating($menuItemId);

        return response()->json([
            'success' => true,
            'message' => 'Review updated successfully',
            'data' => $review->load('user:id,name,avatar')
        ]);
    }

    // Delete a review
    public function destroy($menuItemId, $reviewId)
    {
        $review = MenuItemReview::where('id', $reviewId)
            ->where('user_id', auth()->id())
            ->where('menu_item_id', $menuItemId)
            ->firstOrFail();

        $review->delete();

        // Update menu item average rating
        $this->updateMenuItemRating($menuItemId);

        return response()->json([
            'success' => true,
            'message' => 'Review deleted successfully'
        ]);
    }

    // Get user's review for a specific menu item
    public function getUserReview($menuItemId)
    {
        $review = MenuItemReview::where('user_id', auth()->id())
            ->where('menu_item_id', $menuItemId)
            ->with('user:id,name,avatar')
            ->first();

        return response()->json([
            'success' => true,
            'data' => $review
        ]);
    }

    // Get user's orders that contain this menu item (for review eligibility)
    public function getUserOrdersForItem($menuItemId)
    {
        $orders = Order::where('user_id', auth()->id())
            ->where('status', 'completed')
            ->whereHas('order_items', function($query) use ($menuItemId) {
                $query->where('menu_item_id', $menuItemId);
            })
            ->with(['order_items' => function($query) use ($menuItemId) {
                $query->where('menu_item_id', $menuItemId);
            }])
            ->orderBy('completed_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }

    // Private method to update menu item average rating
    private function updateMenuItemRating($menuItemId)
    {
        $reviews = MenuItemReview::where('menu_item_id', $menuItemId)->get();
        
        if ($reviews->count() > 0) {
            $averageRating = $reviews->avg('rating');
            $reviewsCount = $reviews->count();
            
            MenuItem::where('id', $menuItemId)->update([
                'average_rating' => round($averageRating, 2),
                'reviews_count' => $reviewsCount
            ]);
        } else {
            MenuItem::where('id', $menuItemId)->update([
                'average_rating' => null,
                'reviews_count' => 0
            ]);
        }
    }
}