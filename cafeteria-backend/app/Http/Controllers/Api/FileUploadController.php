<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class FileUploadController extends Controller
{
    public function uploadAvatar(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $file = $request->file('avatar');
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('avatars', $filename, 'public');

            // Update user avatar
            $user = $request->user();
            
            // Delete old avatar if exists
            if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                Storage::disk('public')->delete($user->avatar);
            }
            
            $user->update(['avatar' => $path]);

            return response()->json([
                'success' => true,
                'message' => 'Avatar uploaded successfully',
                'data' => [
                    'avatar_url' => Storage::url($path),
                    'avatar_path' => $path
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload avatar',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function uploadMenuItemImage(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120', // 5MB max
            'menu_item_id' => 'sometimes|exists:menu_items,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $file = $request->file('image');
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('menu-items', $filename, 'public');

            // If menu_item_id is provided, update the menu item
            if ($request->has('menu_item_id')) {
                $menuItem = \App\Models\MenuItem::find($request->menu_item_id);
                if ($menuItem) {
                    // Delete old image if exists
                    if ($menuItem->image && Storage::disk('public')->exists($menuItem->image)) {
                        Storage::disk('public')->delete($menuItem->image);
                    }
                    
                    $menuItem->update(['image' => $path]);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Image uploaded successfully',
                'data' => [
                    'image_url' => Storage::url($path),
                    'image_path' => $path
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload image',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function deleteFile(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file_path' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $filePath = $request->file_path;
            
            if (Storage::disk('public')->exists($filePath)) {
                Storage::disk('public')->delete($filePath);
                
                return response()->json([
                    'success' => true,
                    'message' => 'File deleted successfully'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'File not found'
                ], 404);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete file',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}