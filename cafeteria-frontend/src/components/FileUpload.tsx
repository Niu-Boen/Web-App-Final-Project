import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';

interface FileUploadProps {
  type: 'avatar' | 'menu-item';
  currentImage?: string;
  onUploadSuccess: (imageUrl: string, imagePath: string) => void;
  menuItemId?: number;
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  type,
  currentImage,
  onUploadSuccess,
  menuItemId,
  className = ''
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB for menu items, 2MB for avatars)
    const maxSize = type === 'menu-item' ? 5 * 1024 * 1024 : 2 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`File size must be less than ${type === 'menu-item' ? '5MB' : '2MB'}`);
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      
      if (type === 'avatar') {
        formData.append('avatar', file);
        const response = await api.post('/upload/avatar', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        if (response.data.success) {
          onUploadSuccess(response.data.data.avatar_url, response.data.data.avatar_path);
          toast.success('Avatar uploaded successfully!');
        }
      } else {
        formData.append('image', file);
        if (menuItemId) {
          formData.append('menu_item_id', menuItemId.toString());
        }
        
        const response = await api.post('/upload/menu-item-image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        if (response.data.success) {
          onUploadSuccess(response.data.data.image_url, response.data.data.image_path);
          toast.success('Image uploaded successfully!');
        }
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload image');
      setPreview(currentImage || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {preview ? (
        <div className="relative group">
          <img
            src={preview}
            alt="Preview"
            className={`w-full h-full object-cover rounded-lg ${
              type === 'avatar' ? 'w-24 h-24 rounded-full' : 'w-full h-48'
            }`}
          />
          
          {/* Overlay with actions */}
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
            <button
              onClick={triggerFileSelect}
              disabled={isUploading}
              className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
              title="Change image"
            >
              <Upload size={16} className="text-gray-700" />
            </button>
            <button
              onClick={handleRemoveImage}
              disabled={isUploading}
              className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
              title="Remove image"
            >
              <X size={16} className="text-gray-700" />
            </button>
          </div>
          
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={triggerFileSelect}
          disabled={isUploading}
          className={`border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 transition-colors flex flex-col items-center justify-center text-gray-500 hover:text-primary-600 ${
            type === 'avatar' ? 'w-24 h-24 rounded-full' : 'w-full h-48'
          } ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {isUploading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          ) : (
            <>
              <ImageIcon size={type === 'avatar' ? 24 : 32} className="mb-2" />
              <span className="text-sm font-medium">
                {type === 'avatar' ? 'Upload Avatar' : 'Upload Image'}
              </span>
              <span className="text-xs text-gray-400 mt-1">
                {type === 'avatar' ? 'Max 2MB' : 'Max 5MB'}
              </span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default FileUpload;

