import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../utils/api';

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'providers' | 'products' | 'promotions'>('stats');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    } else if (user && user.role !== 'admin' && user.role !== 'super admin') {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'super admin')) {
      if (activeTab === 'stats') {
        loadStats();
      } else if (activeTab === 'users') {
        loadUsers();
      } else if (activeTab === 'providers') {
        loadProviders();
      } else if (activeTab === 'products') {
        loadProducts();
      }
    }
  }, [user, activeTab, currentPage]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await adminAPI.getStats();
      setStats(data.stats);
    } catch (err: any) {
      setError(err.message || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminAPI.getAllUsers({ 
        search: searchTerm.trim() || undefined,
        page: currentPage,
        limit: 20 
      });
      setUsers(response.users || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadProviders = async () => {
    setLoading(true);
    setError('');
    try {
      // Load all provider types (product provider, service provider, seller)
      // We'll filter on frontend since backend only supports single role filter
      const response = await adminAPI.getAllUsers({ 
        search: searchTerm.trim() || undefined,
        page: currentPage,
        limit: 50 
      });
      // Filter to show only providers
      const providers = (response.users || []).filter((u: any) => 
        u.role === 'product provider' || u.role === 'service provider' || u.role === 'seller'
      );
      setUsers(providers);
    } catch (err: any) {
      setError(err.message || 'Failed to load providers');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminAPI.getAllProducts({ 
        search: searchTerm.trim() || undefined,
        page: currentPage,
        limit: 20 
      });
      setProducts(response.products || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyProvider = async (userId: string) => {
    if (!window.confirm('Are you sure you want to verify this provider?')) {
      return;
    }
    setError('');
    try {
      await adminAPI.verifyProvider(userId);
      if (activeTab === 'providers') {
        await loadProviders();
      }
      if (activeTab === 'stats') {
        await loadStats();
      }
      // Reload stats in background
      loadStats();
    } catch (err: any) {
      setError(err.message || 'Failed to verify provider');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    setError('');
    try {
      await adminAPI.deleteUser(userId);
      if (activeTab === 'users') {
        await loadUsers();
      } else if (activeTab === 'providers') {
        await loadProviders();
      }
      // Reload stats in background
      loadStats();
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }
    setError('');
    try {
      await adminAPI.deleteProduct(productId);
      await loadProducts();
      // Reload stats in background
      loadStats();
    } catch (err: any) {
      setError(err.message || 'Failed to delete product');
    }
  };

  const handleToggleProductStatus = async (productId: string) => {
    setError('');
    try {
      await adminAPI.toggleProductStatus(productId);
      await loadProducts();
      // Reload stats in background
      loadStats();
    } catch (err: any) {
      setError(err.message || 'Failed to update product status');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && user.role !== 'super admin')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Welcome, {user.name}! Manage users, products, and platform settings.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'stats', label: 'Statistics' },
              { id: 'users', label: 'Users' },
              { id: 'providers', label: 'Providers' },
              { id: 'products', label: 'Products' },
              { id: 'promotions', label: 'Promotions' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setCurrentPage(1);
                  setSearchTerm('');
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-[#2563EB] text-[#2563EB]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'stats' && (
            <div>
              {loading ? (
                <div className="text-center py-12">Loading statistics...</div>
              ) : stats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Total Users</h3>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Total Providers</h3>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalProviders}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Verified Providers</h3>
                    <p className="text-3xl font-bold text-green-600">{stats.verifiedProviders}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Pending Verification</h3>
                    <p className="text-3xl font-bold text-yellow-600">{stats.pendingVerification}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Total Products</h3>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Active Products</h3>
                    <p className="text-3xl font-bold text-green-600">{stats.activeProducts}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">No statistics available</div>
              )}
            </div>
          )}

          {(activeTab === 'users' || activeTab === 'providers') && (
            <div>
              <div className="mb-4 flex gap-4">
                <input
                  type="text"
                  placeholder={activeTab === 'users' ? 'Search users by name or email...' : 'Search providers by name or email...'}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      setCurrentPage(1);
                      if (activeTab === 'users') {
                        loadUsers();
                      } else {
                        loadProviders();
                      }
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#2563EB] focus:border-[#2563EB]"
                />
                <button
                  onClick={() => {
                    setCurrentPage(1);
                    if (activeTab === 'users') {
                      loadUsers();
                    } else {
                      loadProviders();
                    }
                  }}
                  className="px-6 py-2 bg-[#2563EB] text-white rounded-md hover:bg-[#1d4ed8]"
                >
                  Search
                </button>
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setCurrentPage(1);
                      if (activeTab === 'users') {
                        loadUsers();
                      } else {
                        loadProviders();
                      }
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Clear
                  </button>
                )}
              </div>

              {loading ? (
                <div className="text-center py-12">Loading users...</div>
              ) : users.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <div className="text-gray-500">No users found</div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((userItem) => (
                        <tr key={userItem._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{userItem.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{userItem.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{userItem.role}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {activeTab === 'providers' ? (
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                userItem.isVerified 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {userItem.isVerified ? 'Verified' : 'Pending'}
                              </span>
                            ) : (
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                userItem.isActive !== false 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {userItem.isActive !== false ? 'Active' : 'Inactive'}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            {activeTab === 'providers' && !userItem.isVerified && (
                              <button
                                onClick={() => handleVerifyProvider(userItem._id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Verify
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteUser(userItem._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'products' && (
            <div>
              <div className="mb-4 flex gap-4">
                <input
                  type="text"
                  placeholder="Search products by name or description..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      setCurrentPage(1);
                      loadProducts();
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#2563EB] focus:border-[#2563EB]"
                />
                <button
                  onClick={() => {
                    setCurrentPage(1);
                    loadProducts();
                  }}
                  className="px-6 py-2 bg-[#2563EB] text-white rounded-md hover:bg-[#1d4ed8]"
                >
                  Search
                </button>
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setCurrentPage(1);
                      loadProducts();
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Clear
                  </button>
                )}
              </div>

              {loading ? (
                <div className="text-center py-12">Loading products...</div>
              ) : products.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <div className="text-gray-500">No products found</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
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
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                          <span>Stock: {product.stock || 0}</span>
                          <span className={`px-2 py-1 rounded ${
                            product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {product.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 mb-3">
                          Seller: {product.seller?.name || 'Unknown'}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleToggleProductStatus(product._id)}
                            className={`flex-1 px-3 py-2 rounded text-sm ${
                              product.isActive
                                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                : 'bg-green-100 text-green-800 hover:bg-green-200'
                            }`}
                          >
                            {product.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product._id)}
                            className="flex-1 px-3 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200 text-sm"
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
          )}

          {activeTab === 'promotions' && (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Promotion Management</h3>
              <p className="text-gray-600 mb-6">Create and manage sales, discounts, and promotions</p>
              <Link
                to="/promotions"
                className="inline-block bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Go to Promotion Management Page
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

