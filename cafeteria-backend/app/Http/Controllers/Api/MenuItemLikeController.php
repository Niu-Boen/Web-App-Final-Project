<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MenuItemLike;
use App\Models\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MenuItemLikeController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    // Toggle like for a menu item
    public function toggle(Request $request, $menuItemId)
    {
        $user = $request->user();
        $menuItem = MenuItem::findOrFail($menuItemId);

        $existingLike = MenuItemLike::where('user_id', $user->id)
            ->where('menu_item_id', $menuItemId)
            ->first();

        if ($existingLike) {
            // Unlike
            $existingLike->delete();
            $liked = false;
        } else {
            // Like
            MenuItemLike::create([
                'user_id' => $user->id,
                'menu_item_id' => $menuItemId
            ]);
            $liked = true;
        }

        $likesCount = MenuItemLike::where('menu_item_id', $menuItemId)->count();

        return response()->json([
            'success' => true,
            'data' => [
                'liked' => $liked,
                'likes_count' => $likesCount
            ]
        ]);
    }

    // Get user's liked menu items
    public function getUserLikes(Request $request)
    {
        $user = $request->user();
        $likedItems = $user->likedMenuItems()
            ->with(['category'])
            ->withCount('likes')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $likedItems
        ]);
    }

    // Get popular menu items (most liked)
    public function getPopular()
    {
        $popularItems = MenuItem::withCount('likes')
            ->with(['category'])
            ->orderBy('likes_count', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $popularItems
        ]);
    }

    // Get likes statistics for admin
    public function getStatistics()
    {
        // Most liked items
        $mostLiked = MenuItem::withCount('likes')
            ->with(['category'])
            ->orderBy('likes_count', 'desc')
            ->limit(10)
            ->get();

        // Likes by category
        $likesByCategory = DB::table('menu_item_likes')
            ->join('menu_items', 'menu_item_likes.menu_item_id', '=', 'menu_items.id')
            ->join('categories', 'menu_items.category_id', '=', 'categories.id')
            ->select('categories.name as category_name', DB::raw('COUNT(*) as likes_count'))
            ->groupBy('categories.id', 'categories.name')
            ->orderBy('likes_count', 'desc')
            ->get();

        // Daily likes trend (last 30 days)
        $dailyLikes = DB::table('menu_item_likes')
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as likes_count'))
            ->where('created_at', '>=', now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'most_liked' => $mostLiked,
                'likes_by_category' => $likesByCategory,
                'daily_likes' => $dailyLikes
            ]
        ]);
    }
}
