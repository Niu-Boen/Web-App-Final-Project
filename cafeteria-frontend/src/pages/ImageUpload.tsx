import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Upload, Image as ImageIcon, Check, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const ImageUpload: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<Array<{
    id: string;
    url: string;
    path: string;
    name: string;
    uploadTime: string;
  }>>([]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // 可以选择多个文件
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} 不是有效的图片文件`);
        continue;
      }

      // 验证文件大小 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} 文件大小超过5MB限制`);
        continue;
      }

      await uploadSingleFile(file);
    }

    // 清空文件输入框
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
        const newImage = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          url: response.data.data.image_url,
          path: response.data.data.image_path,
          name: file.name,
          uploadTime: new Date().toLocaleString('zh-CN')
        };
        
        setUploadedImages(prev => [newImage, ...prev]);
        toast.success(`${file.name} 上传成功！`);
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(`${file.name} 上传失败: ${error.response?.data?.message || '未知错误'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const copyImagePath = (path: string) => {
    navigator.clipboard.writeText(path).then(() => {
      toast.success('图片路径已复制到剪贴板');
    }).catch(() => {
      toast.error('复制失败');
    });
  };

  const deleteImage = (id: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== id));
    toast.info('图片已从列表中移除');
  };

  if (!user || user.role !== 'staff') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">访问被拒绝</h1>
          <p className="text-gray-600">您没有权限访问此页面。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/menu-management')}
            className="mr-4 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            title="返回菜单管理"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-gray-800">图片上传</h1>
        </div>
      </div>

      {/* 上传区域 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">上传菜单项图片</h2>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
            disabled={isUploading}
          />
          
          <label
            htmlFor="file-upload"
            className={`cursor-pointer flex flex-col items-center ${
              isUploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isUploading ? (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            ) : (
              <Upload className="w-12 h-12 text-gray-400 mb-4" />
            )}
            
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              {isUploading ? '正在上传...' : '点击或拖拽上传图片'}
            </h3>
            
            <p className="text-sm text-gray-500 mb-2">
              支持 JPG, PNG, GIF 格式，单个文件最大 5MB
            </p>
            
            <p className="text-xs text-gray-400">
              可以同时选择多个文件进行批量上传
            </p>
          </label>
        </div>

        {isUploading && (
          <div className="mt-4 text-center">
            <p className="text-blue-600">正在上传图片，请稍候...</p>
          </div>
        )}
      </div>

      {/* 已上传图片列表 */}
      {uploadedImages.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            已上传图片 ({uploadedImages.length})
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {uploadedImages.map((image) => (
              <div key={image.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="aspect-w-16 aspect-h-9 mb-3">
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-800 truncate" title={image.name}>
                    {image.name}
                  </h3>
                  
                  <p className="text-xs text-gray-500">
                    上传时间: {image.uploadTime}
                  </p>
                  
                  <div className="bg-gray-100 p-2 rounded text-xs font-mono text-gray-600 break-all">
                    {image.path}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => copyImagePath(image.path)}
                      className="flex-1 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors flex items-center justify-center"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      复制路径
                    </button>
                    
                    <button
                      onClick={() => deleteImage(image.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                    >
                      移除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">使用说明:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 点击"复制路径"按钮复制图片路径</li>
              <li>• 在菜单管理中创建菜单项时，将路径粘贴到图片字段</li>
              <li>• 图片路径格式: menu-items/filename.jpg</li>
              <li>• "移除"只是从此列表中删除，不会删除服务器上的文件</li>
            </ul>
          </div>
        </div>
      )}

      {/* 空状态 */}
      {uploadedImages.length === 0 && !isUploading && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">还没有上传任何图片</h3>
          <p className="text-gray-500">上传图片后，它们将显示在这里</p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;