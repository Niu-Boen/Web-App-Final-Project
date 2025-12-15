<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'user_id',
        'total_amount',
        'status',
        'payment_status',
        'pickup_time',
        'pickup_person_name',
        'pickup_person_id',
        'special_instructions',
        'confirmed_at',
        'ready_at',
        'completed_at',
        'order_source',
        'preparation_time_minutes',
        'queue_position',
        'discount_amount',
        'payment_method',
        'items_count',
        'average_item_price',
        'is_repeat_customer',
        'customer_order_count',
        'order_time',
        'day_of_week',
        'is_peak_hour',
        'customer_notes',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'average_item_price' => 'decimal:2',
        'pickup_time' => 'datetime',
        'confirmed_at' => 'datetime',
        'ready_at' => 'datetime',
        'completed_at' => 'datetime',
        'is_repeat_customer' => 'boolean',
        'is_peak_hour' => 'boolean',
        'order_time' => 'datetime:H:i',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeActive($query)
    {
        return $query->whereIn('status', ['pending', 'confirmed', 'preparing', 'ready']);
    }

    // Helper methods
    public function generateOrderNumber()
    {
        return 'ORD-' . date('Ymd') . '-' . str_pad($this->id, 4, '0', STR_PAD_LEFT);
    }

    public function canBeCancelled()
    {
        return in_array($this->status, ['pending', 'confirmed']);
    }

    public function isReadyForPickup()
    {
        return $this->status === 'ready';
    }
}
