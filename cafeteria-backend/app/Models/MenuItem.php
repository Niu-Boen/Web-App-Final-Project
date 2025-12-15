<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class MenuItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'price',
        'image',
        'ingredients',
        'allergens',
        'category_id',
        'is_available',
        'is_featured',
        'preparation_time',
        'stock_quantity',
        'average_rating',
        'reviews_count',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'ingredients' => 'array',
        'allergens' => 'array',
        'is_available' => 'boolean',
        'is_featured' => 'boolean',
        'preparation_time' => 'integer',
        'stock_quantity' => 'integer',
        'average_rating' => 'decimal:2',
        'reviews_count' => 'integer',
    ];

    // Relationships
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function likes()
    {
        return $this->hasMany(MenuItemLike::class);
    }

    public function likedByUsers()
    {
        return $this->belongsToMany(User::class, 'menu_item_likes');
    }

    // Helper methods
    public function isLikedBy($userId)
    {
        return $this->likes()->where('user_id', $userId)->exists();
    }

    public function getLikesCountAttribute()
    {
        return $this->likes()->count();
    }

    public function reviews()
    {
        return $this->hasMany(MenuItemReview::class);
    }



    // Scopes
    public function scopeAvailable($query)
    {
        return $query->where('is_available', true);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeInStock($query)
    {
        return $query->where(function($q) {
            $q->whereNull('stock_quantity')
              ->orWhere('stock_quantity', '>', 0);
        });
    }
}
