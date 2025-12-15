<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MenuItemReview extends Model
{
    protected $fillable = [
        'user_id',
        'menu_item_id',
        'order_id',
        'rating',
        'comment'
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function menuItem()
    {
        return $this->belongsTo(MenuItem::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    // Scopes
    public function scopeByRating($query, $rating)
    {
        return $query->where('rating', $rating);
    }

    public function scopeRecent($query)
    {
        return $query->orderBy('created_at', 'desc');
    }
}
