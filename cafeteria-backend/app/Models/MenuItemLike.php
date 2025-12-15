<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MenuItemLike extends Model
{
    protected $fillable = [
        'user_id',
        'menu_item_id'
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
}
