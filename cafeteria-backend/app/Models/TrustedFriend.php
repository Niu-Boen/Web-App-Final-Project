<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class TrustedFriend extends Model
{
    protected $fillable = [
        'user_id',
        'friend_id',
        'permission_type',
        'expires_at',
        'usage_limit',
        'usage_count',
        'is_active'
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'is_active' => 'boolean'
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function friend()
    {
        return $this->belongsTo(User::class, 'friend_id');
    }

    // Helper methods
    public function isValid()
    {
        if (!$this->is_active) {
            return false;
        }

        // Check expiration for temporary permissions
        if ($this->permission_type === 'temporary' && $this->expires_at && $this->expires_at->isPast()) {
            return false;
        }

        // Check usage limit
        if ($this->usage_limit && $this->usage_count >= $this->usage_limit) {
            return false;
        }

        return true;
    }

    public function canPickup()
    {
        return $this->isValid();
    }

    public function incrementUsage()
    {
        $this->increment('usage_count');
        
        // Auto-deactivate if usage limit reached
        if ($this->usage_limit && $this->usage_count >= $this->usage_limit) {
            $this->update(['is_active' => false]);
        }
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeValid($query)
    {
        return $query->where('is_active', true)
            ->where(function($q) {
                $q->where('permission_type', 'permanent')
                  ->orWhere(function($subQ) {
                      $subQ->where('permission_type', 'temporary')
                           ->where(function($expQ) {
                               $expQ->whereNull('expires_at')
                                    ->orWhere('expires_at', '>', Carbon::now());
                           });
                  });
            })
            ->where(function($q) {
                $q->whereNull('usage_limit')
                  ->orWhereRaw('usage_count < usage_limit');
            });
    }
}
