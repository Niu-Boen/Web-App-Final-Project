import React, { useState } from 'react';
import { Upload, X, Check, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageSelect: (imagePath: string) => void;
}

interface UploadedImage {
  id: string;
  url: string;
  path: string;
  name: string;
  uploadTime: string;
}

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  isOpen,
  onClose,
  onImageSelect
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Can select multiple files
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not a valid image file`);
        continue;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} file size exceeds 5MB limit`);
        continue;
      }

      await uploadSingleFile(file);
    }

    // Clear file input
    event.target.value = '';
  };

  const uploadSingleFile = async (file: File) => {
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await api.post('/upload/menu-item-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        const newImage: UploadedImage = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          url: response.data.data.image_url,
          path: response.data.data.image_path,
          name: file.name,
          uploadTime: new Date().toLocaleString('zh-CN')
        };
        
        setUploadedImages(prev => [newImage, ...prev]);
        toast.success(`${file.name} uploaded successfully!`);
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(`${file.name} upload failed: ${error.response?.data?.message || 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const selectImage = (imagePath: string) => {
    onImageSelect(imagePath);
    toast.success('Image selected');
    onClose();
  };

  const deleteImage = (id: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== id));
    toast.info('Image removed from list');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Image Upload</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Upload Area */}
        <div className="mb-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="modal-file-upload"
              disabled={isUploading}
            />
            
            <label
              htmlFor="modal-file-upload"
              className={`cursor-pointer flex flex-col items-center ${
                isUploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isUploading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
              ) : (
                <Upload className="w-8 h-8 text-gray-400 mb-3" />
              )}
              
              <h4 className="text-md font-medium text-gray-700 mb-1">
                {isUploading ? 'Uploading...' : 'Click or drag to upload images'}
              </h4>
              
              <p className="text-sm text-gray-500">
                Supports JPG, PNG and GIF formats, with a maximum file size of 5MB per file
              </p>
            </label>
          </div>
        </div>

        {/* 已上传图片列表 */}
        <div className="max-h-96 overflow-y-auto">
          {uploadedImages.length > 0 ? (
            <div>
              <h4 className="text-md font-medium text-gray-800 mb-3">
                已上传图片 ({uploadedImages.length})
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {uploadedImages.map((image) => (
                  <div key={image.id} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                    <div className="aspect-w-16 aspect-h-9 mb-2">
                      <img
                        src={image.url}
                        alt={image.name}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <h5 className="font-medium text-gray-800 text-sm truncate" title={image.name}>
                        {image.name}
                      </h5>
                      
                      <p className="text-xs text-gray-500">
                        {image.uploadTime}
                      </p>
                      
                      <div className="bg-gray-100 p-1 rounded text-xs font-mono text-gray-600 break-all">
                        {image.path}
                      </div>
                      
                      <div className="flex space-x-1">
                        <button
                          onClick={() => selectImage(image.path)}
                          className="flex-1 bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 transition-colors flex items-center justify-center"
                        >
                          <Check className="w-3 h-3 mr-1" />
                          选择
                        </button>
                        
                        <button
                          onClick={() => deleteImage(image.id)}
                          className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 transition-colors"
                        >
                          移除
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h4 className="text-md font-medium text-gray-600 mb-1">还没有上传任何图片</h4>
              <p className="text-gray-500 text-sm">上传图片后，它们将显示在这里</p>
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-end mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadModal;