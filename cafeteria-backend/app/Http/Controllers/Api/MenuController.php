<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MenuController extends Controller
{
    public function __construct()
    {
        // Apply staff middleware only to management methods
        $this->middleware('auth:sanctum')->only(['store', 'update', 'destroy']);
        $this->middleware('role:staff')->only(['store', 'update', 'destroy']);
    }
    public function categories()
    {
        $categories = Category::with(['children', 'menuItems' => function($query) {
            $query->available()->inStock();
        }])
        ->active()
        ->parent()
        ->orderBy('sort_order')
        ->get();

        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }

    public function index(Request $request)
    {
        $query = MenuItem::with('category')
            ->available()
            ->inStock();

        // Filter by category
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Search by name
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Filter by featured
        if ($request->has('featured')) {
            $query->featured();
        }

        // Sort options
        $sortBy = $request->get('sort_by', 'name');
        $sortOrder = $request->get('sort_order', 'asc');
        
        if (in_array($sortBy, ['name', 'price', 'created_at'])) {
            $query->orderBy($sortBy, $sortOrder);
        }

        $menuItems = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $menuItems
        ]);
    }

    public function show($id)
    {
        $menuItem = MenuItem::with('category')->find($id);

        if (!$menuItem) {
            return response()->json([
                'success' => false,
                'message' => 'Menu item not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $menuItem
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'category_id' => 'required|exists:categories,id',
            'ingredients' => 'nullable|array',
            'allergens' => 'nullable|array',
            'preparation_time' => 'nullable|integer|min:1',
            'stock_quantity' => 'nullable|integer|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->all();

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('menu-items', 'public');
        }

        $menuItem = MenuItem::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Menu item created successfully',
            'data' => $menuItem->load('category')
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $menuItem = MenuItem::find($id);

        if (!$menuItem) {
            return response()->json([
                'success' => false,
                'message' => 'Menu item not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'category_id' => 'sometimes|exists:categories,id',
            'ingredients' => 'nullable|array',
            'allergens' => 'nullable|array',
            'preparation_time' => 'nullable|integer|min:1',
            'stock_quantity' => 'nullable|integer|min:0',
            'is_available' => 'sometimes|boolean',
            'is_featured' => 'sometimes|boolean',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->all();

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('menu-items', 'public');
        }

        $menuItem->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Menu item updated successfully',
            'data' => $menuItem->load('category')
        ]);
    }

    public function destroy($id)
    {
        $menuItem = MenuItem::find($id);

        if (!$menuItem) {
            return response()->json([
                'success' => false,
                'message' => 'Menu item not found'
            ], 404);
        }

        $menuItem->delete();

        return response()->json([
            'success' => true,
            'message' => 'Menu item deleted successfully'
        ]);
    }

    // Get menu item statistics
    public function getItemStats($id)
    {
        $menuItem = MenuItem::findOrFail($id);
        
        // Get purchase statistics
        $stats = MenuItem::select('menu_items.*')
            ->selectRaw('COALESCE(SUM(order_items.quantity), 0) as total_purchased')
            ->selectRaw('COALESCE(COUNT(DISTINCT orders.user_id), 0) as unique_buyers')
            ->selectRaw('COALESCE(COUNT(DISTINCT order_items.order_id), 0) as total_orders')
            ->selectRaw('COALESCE(COUNT(DISTINCT order_items.order_id) * 100.0 / NULLIF((SELECT COUNT(*) FROM orders WHERE payment_status = "paid"), 0), 0) as purchase_ratio')
            ->leftJoin('order_items', 'menu_items.id', '=', 'order_items.menu_item_id')
            ->leftJoin('orders', function($join) {
                $join->on('order_items.order_id', '=', 'orders.id')
                     ->where('orders.payment_status', '=', 'paid');
            })
            ->where('menu_items.id', $id)
            ->groupBy('menu_items.id')
            ->first();

        // Get monthly sales trend (last 6 months)
        $monthlySales = Order::selectRaw('YEAR(created_at) as year, MONTH(created_at) as month, SUM(order_items.quantity) as quantity')
            ->join('order_items', 'orders.id', '=', 'order_items.order_id')
            ->where('order_items.menu_item_id', $id)
            ->where('orders.payment_status', 'paid')
            ->where('orders.created_at', '>=', now()->subMonths(6))
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get()
            ->map(function($item) {
                return [
                    'month' => date('M Y', mktime(0, 0, 0, $item->month, 1, $item->year)),
                    'quantity' => $item->quantity
                ];
            });

        // Get rating distribution
        $ratingDistribution = MenuItemReview::selectRaw('rating, COUNT(*) as count')
            ->where('menu_item_id', $id)
            ->groupBy('rating')
            ->orderBy('rating')
            ->get()
            ->map(function($item) {
                return [
                    'rating' => $item->rating . ' Stars',
                    'count' => $item->count
                ];
            });

        // Get comparison with similar items in same category
        $categoryComparison = MenuItem::select('menu_items.name')
            ->selectRaw('COALESCE(SUM(order_items.quantity), 0) as total_sold')
            ->selectRaw('COALESCE(COUNT(likes.id), 0) as likes_count')
            ->leftJoin('order_items', 'menu_items.id', '=', 'order_items.menu_item_id')
            ->leftJoin('orders', function($join) {
                $join->on('order_items.order_id', '=', 'orders.id')
                     ->where('orders.payment_status', '=', 'paid');
            })
            ->leftJoin('menu_item_likes as likes', 'menu_items.id', '=', 'likes.menu_item_id')
            ->where('menu_items.category_id', $menuItem->category_id)
            ->groupBy('menu_items.id', 'menu_items.name')
            ->orderBy('total_sold', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'item_stats' => $stats,
                'monthly_sales' => $monthlySales,
                'rating_distribution' => $ratingDistribution,
                'category_comparison' => $categoryComparison
            ]
        ]);
    }
}