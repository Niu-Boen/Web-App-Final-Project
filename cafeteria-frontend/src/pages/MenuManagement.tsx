import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { fetchCategories, fetchMenuItems } from '../store/slices/menuSlice';
import { Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import ImageUploadModal from '../components/ImageUploadModal';
import api from '../services/api';

interface MenuItemForm {
  name: string;
  description: string;
  price: string;
  category_id: string;
  ingredients: string;
  allergens: string;
  preparation_time: string;
  stock_quantity: string;
  is_available: boolean;
  is_featured: boolean;
  image?: string;
}

const MenuManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { categories, menuItems } = useSelector((state: RootState) => state.menu);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showImageUpload, setShowImageUpload] = useState(false);


  const [formData, setFormData] = useState<MenuItemForm>({
    name: '',
    description: '',
    price: '',
    category_id: '',
    ingredients: '',
    allergens: '',
    preparation_time: '15',
    stock_quantity: '100',
    is_available: true,
    is_featured: false,
    image: ''
  });

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchMenuItems({}));
  }, [dispatch]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category_id: '',
      ingredients: '',
      allergens: '',
      preparation_time: '15',
      stock_quantity: '100',
      is_available: true,
      is_featured: false,
      image: ''
    });
    setEditingItem(null);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.category_id) {
      toast.error('Please fill in all required fields');
      return;
    }

    // For new items, require image to be uploaded first
    if (!editingItem && !formData.image) {
      toast.error('Please upload an image before saving the menu item');
      return;
    }

    try {
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        preparation_time: parseInt(formData.preparation_time),
        stock_quantity: parseInt(formData.stock_quantity),
        ingredients: formData.ingredients ? formData.ingredients.split(',').map(i => i.trim()) : [],
        allergens: formData.allergens ? formData.allergens.split(',').map(a => a.trim()) : []
      };

      if (editingItem) {
        await api.put(`/menu/${editingItem.id}`, submitData);
        toast.success('Menu item updated successfully');
      } else {
        await api.post('/menu', submitData);
        toast.success('Menu item created successfully');
      }

      // Refresh list after successful save, but don't close modal
      dispatch(fetchMenuItems({}));
    } catch (error: any) {
      console.error('Save error:', error);
      if (error.response?.data?.errors) {
        // Handle validation errors
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat();
        toast.error(`Validation errors: ${errorMessages.join(', ')}`);
      } else {
        toast.error(error.response?.data?.message || 'Failed to save menu item');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);

    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      category_id: item.category_id.toString(),
      ingredients: item.ingredients ? item.ingredients.join(', ') : '',
      allergens: item.allergens ? item.allergens.join(', ') : '',
      preparation_time: item.preparation_time.toString(),
      stock_quantity: item.stock_quantity?.toString() || '100',
      is_available: item.is_available,
      is_featured: item.is_featured,
      image: item.image || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      try {
        await api.delete(`/menu/${id}`);
        toast.success('Menu item deleted successfully');
        dispatch(fetchMenuItems({}));
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to delete menu item');
      }
    }
  };

  const handleImageSelect = (imagePath: string) => {
    setFormData({ ...formData, image: imagePath });
    toast.success('Image selected and set');
  };

  // Removed modal close function - can only close through save button

  if (!user || user.role !== 'staff') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Menu Management</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Menu Item
        </button>
      </div>

      {/* Menu Items List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {menuItems.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {item.image ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={item.image.startsWith('http') ? item.image : `http://localhost:8000/storage/${item.image}`}
                            alt={item.name}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.category?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ฿{parseFloat(item.price.toString()).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.stock_quantity || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.is_available 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.is_available ? 'Available' : 'Unavailable'}
                      </span>
                      {item.is_featured && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Featured
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Add/Edit Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
          onClick={handleCloseModal}
        >
          <div 
            className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white" 
            onClick={(e) => {
              // Prevent event bubbling to background, avoid accidental closing
              e.stopPropagation();
            }}
          >
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h3>
              
              {!editingItem && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-700">
                    <strong>Workflow:</strong> 1️⃣ Upload image → 2️⃣ Fill in details → 3️⃣ Click create to save
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    💡 Tip: You can click the blank area or close button to close the modal
                  </p>
                </div>
              )}
              
              {editingItem && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-700">
                    <strong>Edit Mode:</strong> Click "Update" to save changes after modifying information
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">
                    💡 Tip: You can click the blank area or close button to close the modal
                  </p>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Image Path Input */}
                <div className="p-4 border-2 rounded-lg border-blue-200 bg-blue-50">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image Path {!editingItem && <span className="text-red-500">*</span>}
                  </label>
                  
                  <div className="mb-3 p-3 bg-blue-100 border border-blue-300 rounded-md">
                    <p className="text-sm text-blue-700 font-medium mb-1">
                      📝 Instructions:
                    </p>
                    <ol className="text-xs text-blue-600 space-y-1">
                      <li>1. Click the "Upload Image" button below</li>
                      <li>2. Upload and select image in the modal</li>
                      <li>3. Or manually enter the image path</li>
                    </ol>
                  </div>
                  
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) => setFormData({...formData, image: e.target.value})}
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                      placeholder="e.g., menu-items/dish-001.jpg"
                      required={!editingItem}
                    />
                    <button
                      type="button"
                      onClick={() => setShowImageUpload(true)}
                      className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 flex items-center"
                    >
                      <ImageIcon className="w-4 h-4 mr-1" />
                      Upload Image
                    </button>
                  </div>
                  
                  {formData.image && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">Image Preview:</p>
                      <img
                        src={formData.image.startsWith('http') ? formData.image : `http://localhost:8000/storage/${formData.image}`}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg border"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category *</label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price (฿) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
                    <input
                      type="number"
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Preparation Time (minutes)</label>
                    <input
                      type="number"
                      value={formData.preparation_time}
                      onChange={(e) => setFormData({...formData, preparation_time: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ingredients (comma separated)</label>
                  <input
                    type="text"
                    value={formData.ingredients}
                    onChange={(e) => setFormData({...formData, ingredients: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="e.g., chicken, rice, vegetables"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Allergens (comma separated)</label>
                  <input
                    type="text"
                    value={formData.allergens}
                    onChange={(e) => setFormData({...formData, allergens: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="e.g., nuts, dairy, gluten"
                  />
                </div>
                

                
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_available}
                      onChange={(e) => setFormData({...formData, is_available: e.target.checked})}
                      className="mr-2"
                    />
                    Available
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                      className="mr-2"
                    />
                    Featured
                  </label>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={!editingItem && !formData.image}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      !editingItem && !formData.image
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                    title={!editingItem && !formData.image ? 'Please upload an image first' : ''}
                  >
                    {editingItem ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Image Upload Modal */}
      <ImageUploadModal
        isOpen={showImageUpload}
        onClose={() => setShowImageUpload(false)}
        onImageSelect={handleImageSelect}
      />
    </div>
  );
};

export default MenuManagement;

