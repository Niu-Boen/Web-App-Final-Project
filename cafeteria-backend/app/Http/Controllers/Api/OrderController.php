<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with(['orderItems.menuItem', 'user'])
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $orders = $query->paginate($request->get('per_page', 10));

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'items' => 'required|array|min:1',
            'items.*.menu_item_id' => 'required|exists:menu_items,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.special_requests' => 'nullable|string|max:500',
            'pickup_time' => 'nullable|date|after:now',
            'special_instructions' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $user = $request->user();
            $totalAmount = 0;
            $orderItems = [];

            // Calculate total and validate items
            foreach ($request->items as $item) {
                $menuItem = MenuItem::find($item['menu_item_id']);
                
                if (!$menuItem->is_available) {
                    throw new \Exception("Item '{$menuItem->name}' is not available");
                }

                $itemTotal = $menuItem->price * $item['quantity'];
                $totalAmount += $itemTotal;

                $orderItems[] = [
                    'menu_item_id' => $menuItem->id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $menuItem->price,
                    'total_price' => $itemTotal,
                    'special_requests' => $item['special_requests'] ?? null,
                ];
            }

            // Refresh user data to get latest balance
            $user->refresh();
            
            // Check if user has sufficient balance
            if ($user->account_balance < $totalAmount) {
                throw new \Exception('Insufficient account balance. Current balance: ฿' . number_format($user->account_balance, 2) . ', Required: ฿' . number_format($totalAmount, 2));
            }

            // Calculate statistics fields
            $itemsCount = array_sum(array_column($orderItems, 'quantity'));
            $averageItemPrice = $itemsCount > 0 ? $totalAmount / $itemsCount : 0;
            $customerOrderCount = Order::where('user_id', $user->id)->where('payment_status', 'paid')->count() + 1;
            $isRepeatCustomer = $customerOrderCount > 1;
            $currentTime = now();
            $orderTime = $currentTime->format('H:i');
            $dayOfWeek = $currentTime->format('l');
            $isPeakHour = in_array($currentTime->hour, [11, 12, 13, 17, 18, 19]); // Peak hours: 11am-1pm, 5pm-7pm
            
            // Create order
            $order = Order::create([
                'user_id' => $user->id,
                'total_amount' => $totalAmount,
                'status' => 'pending',
                'payment_status' => 'pending',
                'pickup_time' => $request->pickup_time,
                'special_instructions' => $request->special_instructions,
                'order_source' => 'web',
                'items_count' => $itemsCount,
                'average_item_price' => $averageItemPrice,
                'is_repeat_customer' => $isRepeatCustomer,
                'customer_order_count' => $customerOrderCount,
                'order_time' => $orderTime,
                'day_of_week' => $dayOfWeek,
                'is_peak_hour' => $isPeakHour,
                'payment_method' => 'balance',
            ]);

            // Generate order number
            $order->update([
                'order_number' => 'ORD-' . date('Ymd') . '-' . str_pad($order->id, 4, '0', STR_PAD_LEFT)
            ]);

            // Create order items and update stock
            foreach ($orderItems as $item) {
                $item['order_id'] = $order->id;
                OrderItem::create($item);
                
                // Reduce stock quantity if available
                $menuItem = MenuItem::find($item['menu_item_id']);
                if ($menuItem->stock_quantity !== null && $menuItem->stock_quantity > 0) {
                    $newStock = max(0, $menuItem->stock_quantity - $item['quantity']);
                    $menuItem->update(['stock_quantity' => $newStock]);
                    
                    // Mark as unavailable if stock is 0
                    if ($newStock === 0) {
                        $menuItem->update(['is_available' => false]);
                    }
                }
            }

            // Deduct from user balance and mark as paid
            $user->decrement('account_balance', $totalAmount);
            $order->update(['payment_status' => 'paid']);

            DB::commit();

            // Load relationships for response
            $order->load(['orderItems.menuItem', 'user']);

            return response()->json([
                'success' => true,
                'message' => 'Order placed successfully',
                'data' => $order
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    public function show($id)
    {
        $order = Order::with(['orderItems.menuItem', 'user'])
            ->where('user_id', request()->user()->id)
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $order
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    public function cancel($id)
    {
        $order = Order::where('user_id', request()->user()->id)->findOrFail($id);

        if (!in_array($order->status, ['pending', 'confirmed'])) {
            return response()->json([
                'success' => false,
                'message' => 'Order cannot be cancelled at this stage'
            ], 400);
        }

        try {
            DB::beginTransaction();

            // Refund the amount if payment was made
            if ($order->payment_status === 'paid') {
                $order->user->increment('account_balance', $order->total_amount);
                $order->update(['payment_status' => 'refunded']);
            }

            $order->update(['status' => 'cancelled']);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Order cancelled successfully',
                'data' => $order->fresh(['orderItems.menuItem', 'user'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel order'
            ], 500);
        }
    }

    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,confirmed,preparing,ready,completed,cancelled'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid status',
                'errors' => $validator->errors()
            ], 422);
        }

        $order = Order::findOrFail($id);
        
        $order->update([
            'status' => $request->status,
            'confirmed_at' => $request->status === 'confirmed' ? now() : $order->confirmed_at,
            'ready_at' => $request->status === 'ready' ? now() : $order->ready_at,
            'completed_at' => $request->status === 'completed' ? now() : $order->completed_at,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Order status updated successfully',
            'data' => $order->fresh(['orderItems.menuItem', 'user'])
        ]);
    }
}