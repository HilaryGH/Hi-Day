import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { promotionAPI, productsAPI } from '../utils/api';

const PromotionManagement = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [promotions, setPromotions] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<any>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'sale',
    discountType: 'percentage',
    discountValue: '',
    maxDiscount: '',
    startDate: '',
    endDate: '',
    categories: [] as string[],
    bannerText: '',
    minPurchaseAmount: '',
    maxUsagePerUser: '',
    totalUsageLimit: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    } else if (user && 
               user.role !== 'admin' && 
               user.role !== 'super admin' && 
               user.role !== 'marketing team') {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'super admin' || user.role === 'marketing team')) {
      loadPromotions();
      loadProducts();
    }
  }, [user]);

  const loadPromotions = async () => {
    setLoading(true);
    try {
      const response = await promotionAPI.getAll({ limit: 50 });
      setPromotions(response.promotions || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load promotions');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await productsAPI.getAll({ limit: 100 });
      setProducts(response.products || []);
    } catch (err: any) {
      console.error('Failed to load products:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.startDate || !formData.endDate || !formData.discountValue) {
      setError('Please fill in all required fields');
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      setError('End date must be after start date');
      return;
    }

    setLoading(true);
    try {
      const promotionData: any = {
        ...formData,
        discountValue: parseFloat(formData.discountValue),
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : undefined,
        minPurchaseAmount: formData.minPurchaseAmount ? parseFloat(formData.minPurchaseAmount) : 0,
        maxUsagePerUser: formData.maxUsagePerUser ? parseInt(formData.maxUsagePerUser) : undefined,
        totalUsageLimit: formData.totalUsageLimit ? parseInt(formData.totalUsageLimit) : undefined,
        products: selectedProducts,
        categories: formData.categories.filter(c => c),
      };

      if (editingPromotion) {
        await promotionAPI.update(editingPromotion._id, promotionData);
      } else {
        await promotionAPI.create(promotionData);
      }

      setShowForm(false);
      setEditingPromotion(null);
      setFormData({
        name: '',
        description: '',
        type: 'sale',
        discountType: 'percentage',
        discountValue: '',
        maxDiscount: '',
        startDate: '',
        endDate: '',
        categories: [],
        bannerText: '',
        minPurchaseAmount: '',
        maxUsagePerUser: '',
        totalUsageLimit: '',
      });
      setSelectedProducts([]);
      await loadPromotions();
    } catch (err: any) {
      setError(err.message || 'Failed to save promotion');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (promotion: any) => {
    setEditingPromotion(promotion);
    setFormData({
      name: promotion.name || '',
      description: promotion.description || '',
      type: promotion.type || 'sale',
      discountType: promotion.discountType || 'percentage',
      discountValue: promotion.discountValue?.toString() || '',
      maxDiscount: promotion.maxDiscount?.toString() || '',
      startDate: promotion.startDate ? new Date(promotion.startDate).toISOString().split('T')[0] : '',
      endDate: promotion.endDate ? new Date(promotion.endDate).toISOString().split('T')[0] : '',
      categories: promotion.categories || [],
      bannerText: promotion.bannerText || '',
      minPurchaseAmount: promotion.minPurchaseAmount?.toString() || '',
      maxUsagePerUser: promotion.maxUsagePerUser?.toString() || '',
      totalUsageLimit: promotion.totalUsageLimit?.toString() || '',
    });
    setSelectedProducts(promotion.products?.map((p: any) => p._id || p) || []);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this promotion? This will remove it from all products.')) {
      return;
    }
    try {
      await promotionAPI.delete(id);
      await loadPromotions();
    } catch (err: any) {
      setError(err.message || 'Failed to delete promotion');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await promotionAPI.toggleStatus(id);
      await loadPromotions();
    } catch (err: any) {
      setError(err.message || 'Failed to toggle promotion status');
    }
  };

  // Note: This function can be used when implementing "Apply to Products" button for specific promotions
  // Currently promotions are applied when created/updated with selected products
  // const handleApplyToProducts = async (promotionId: string, productIds: string[]) => {
  //   try {
  //     await promotionAPI.applyToProducts(promotionId, productIds);
  //     alert('Promotion applied to selected products successfully!');
  //     await loadPromotions();
  //   } catch (err: any) {
  //     setError(err.message || 'Failed to apply promotion to products');
  //   }
  // };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563EB]"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && user.role !== 'super admin' && user.role !== 'marketing team')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Promotion Management</h1>
            <p className="mt-2 text-sm text-gray-600">
              Create and manage sales, discounts, and promotions
            </p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingPromotion(null);
              setFormData({
                name: '',
                description: '',
                type: 'sale',
                discountType: 'percentage',
                discountValue: '',
                maxDiscount: '',
                startDate: '',
                endDate: '',
                categories: [],
                bannerText: '',
                minPurchaseAmount: '',
                maxUsagePerUser: '',
                totalUsageLimit: '',
              });
              setSelectedProducts([]);
            }}
            className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            {showForm ? 'Cancel' : '+ New Promotion'}
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingPromotion ? 'Edit Promotion' : 'Create New Promotion'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Promotion Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#2563EB] focus:border-[#2563EB]"
                    placeholder="e.g., Summer Sale 2024"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="type"
                    required
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#2563EB] focus:border-[#2563EB]"
                  >
                    <option value="sale">Sale</option>
                    <option value="discount">Discount</option>
                    <option value="flash_sale">Flash Sale</option>
                    <option value="bundle">Bundle</option>
                    <option value="seasonal">Seasonal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="discountType"
                    required
                    value={formData.discountType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#2563EB] focus:border-[#2563EB]"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed_amount">Fixed Amount (ETB)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Value <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="discountValue"
                    required
                    min="0"
                    step="0.01"
                    value={formData.discountValue}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#2563EB] focus:border-[#2563EB]"
                    placeholder={formData.discountType === 'percentage' ? 'e.g., 20' : 'e.g., 100'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="startDate"
                    required
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#2563EB] focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="endDate"
                    required
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#2563EB] focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Discount (Optional)
                  </label>
                  <input
                    type="number"
                    name="maxDiscount"
                    min="0"
                    step="0.01"
                    value={formData.maxDiscount}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#2563EB] focus:border-[#2563EB]"
                    placeholder="Maximum discount amount"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Banner Text
                  </label>
                  <input
                    type="text"
                    name="bannerText"
                    value={formData.bannerText}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#2563EB] focus:border-[#2563EB]"
                    placeholder="e.g., Up to 50% OFF!"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#2563EB] focus:border-[#2563EB]"
                  placeholder="Promotion description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Products
                </label>
                <div className="border border-gray-300 rounded-lg p-4 max-h-60 overflow-y-auto">
                  {products.map((product) => (
                    <label key={product._id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProducts([...selectedProducts, product._id]);
                          } else {
                            setSelectedProducts(selectedProducts.filter(id => id !== product._id));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{product.name} - ETB {product.price.toLocaleString()}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingPromotion ? 'Update Promotion' : 'Create Promotion'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingPromotion(null);
                  }}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-6 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Promotions List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">All Promotions</h2>
          </div>
          {promotions.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No promotions found. Create your first promotion!
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {promotions.map((promotion) => (
                <div key={promotion._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{promotion.name}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          promotion.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {promotion.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full capitalize">
                          {promotion.type}
                        </span>
                      </div>
                      {promotion.description && (
                        <p className="text-gray-600 text-sm mb-2">{promotion.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>
                          Discount: {promotion.discountValue}
                          {promotion.discountType === 'percentage' ? '%' : ' ETB'}
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(promotion.startDate).toLocaleDateString()} - {new Date(promotion.endDate).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span>{promotion.products?.length || 0} products</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleStatus(promotion._id)}
                        className={`px-3 py-1 text-sm rounded transition-colors ${
                          promotion.isActive
                            ? 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {promotion.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleEdit(promotion)}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(promotion._id)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromotionManagement;

