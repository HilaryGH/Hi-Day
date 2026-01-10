import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { productsAPI } from '../utils/api';
import ProductListingForm from '../components/ProductListingForm';

const ProviderDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'list' | 'products'>('list');
  const [myProducts, setMyProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    } else if (user && user.role !== 'product provider' && user.role !== 'seller' && user.role !== 'admin') {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && activeTab === 'products') {
      loadMyProducts();
    }
  }, [user, activeTab]);

  const loadMyProducts = async () => {
    setLoading(true);
    try {
      // Note: This would need a backend endpoint to get products by seller
      // For now, we'll show a placeholder
      const response = await productsAPI.getAll({ limit: 100 });
      // Filter products by current user (this is a temporary solution)
      // In production, you'd have a backend endpoint like /products/seller/:id
      setMyProducts(response.products || []);
    } catch (error: any) {
      console.error('Error loading products:', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user || (user.role !== 'product provider' && user.role !== 'seller' && user.role !== 'admin')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Provider Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Welcome back, {user.name}! Manage your products and listings.
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('list')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'list'
                  ? 'border-[#2563EB] text-[#2563EB]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              List New Product
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'products'
                  ? 'border-[#2563EB] text-[#2563EB]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Products
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'list' && <ProductListingForm onSuccess={loadMyProducts} />}
          
          {activeTab === 'products' && (
            <div>
              {loading ? (
                <div className="text-center py-12">
                  <div className="text-gray-500">Loading your products...</div>
                </div>
              ) : myProducts.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <div className="text-gray-500 mb-4">You haven't listed any products yet.</div>
                  <button
                    onClick={() => setActiveTab('list')}
                    className="bg-[#2563EB] text-white px-6 py-2 rounded-lg hover:bg-[#1d4ed8]"
                  >
                    List Your First Product
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myProducts.map((product) => (
                    <div key={product._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                      <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-t-lg overflow-hidden">
                        {product.images && product.images[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-48 object-cover"
                          />
                        ) : (
                          <div className="w-full h-48 flex items-center justify-center text-gray-400">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
                        <p className="text-[#2563EB] font-bold text-xl mb-2">
                          ETB {product.price?.toLocaleString()}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>Stock: {product.stock || 0}</span>
                          <span className={`px-2 py-1 rounded ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {product.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;

