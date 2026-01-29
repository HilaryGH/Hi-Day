import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminAPI, productsAPI } from '../utils/api';
import ProductListingForm from '../components/ProductListingForm';

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'providers' | 'products' | 'create-product' | 'promotions' | 'orders'>('stats');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [orderStats, setOrderStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('');

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
      } else if (activeTab === 'orders') {
        loadOrders();
        loadOrderStats();
      }
    }
  }, [user, activeTab, currentPage, orderStatusFilter, paymentStatusFilter]);

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

  const loadOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminAPI.getAllOrders({ 
        orderStatus: orderStatusFilter || undefined,
        paymentStatus: paymentStatusFilter || undefined,
        search: searchTerm.trim() || undefined,
        page: currentPage,
        limit: 50 
      });
      setOrders(response.orders || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const loadOrderStats = async () => {
    try {
      const response = await adminAPI.getOrderStats();
      setOrderStats(response.stats || null);
    } catch (err: any) {
      console.error('Failed to load order stats:', err);
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

  const handleToggleBestSeller = async (productId: string) => {
    setError('');
    try {
      await productsAPI.toggleBestSeller(productId);
      await loadProducts();
    } catch (err: any) {
      setError(err.message || 'Failed to update best seller status');
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
              { id: 'create-product', label: 'Create Product' },
              { id: 'orders', label: 'Orders & Transactions' },
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
                    ? 'border-[#16A34A] text-[#16A34A]'
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
                    <p className="text-3xl font-bold text-[#16A34A]">{stats.pendingVerification}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Total Products</h3>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Active Products</h3>
                    <p className="text-3xl font-bold text-green-600">{stats.activeProducts}</p>
                  </div>
                  {stats.totalOrders !== undefined && (
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Total Orders</h3>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
                    </div>
                  )}
                  {stats.pendingOrders !== undefined && (
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Pending Orders</h3>
                      <p className="text-3xl font-bold text-[#16A34A]">{stats.pendingOrders}</p>
                    </div>
                  )}
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
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#16A34A] focus:border-[#16A34A]"
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
                  className="px-6 py-2 bg-[#16A34A] text-white rounded-md hover:bg-[#15803D]"
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
                                  : 'bg-orange-100 text-orange-800'
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
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#16A34A] focus:border-[#16A34A]"
                />
                <button
                  onClick={() => {
                    setCurrentPage(1);
                    loadProducts();
                  }}
                  className="px-6 py-2 bg-[#16A34A] text-white rounded-md hover:bg-[#15803D]"
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
                        <p className="text-[#16A34A] font-bold text-xl mb-2">
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
                        {product.isBestSeller && (
                          <div className="mb-2">
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              Best Seller
                            </span>
                          </div>
                        )}
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleToggleProductStatus(product._id)}
                              className={`flex-1 px-3 py-2 rounded text-sm ${
                                product.isActive
                                  ? 'bg-orange-100 text-orange-800 hover:bg-orange-200'
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
                          <button
                            onClick={() => handleToggleBestSeller(product._id)}
                            className={`w-full px-3 py-2 rounded text-sm ${
                              product.isBestSeller
                                ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                          >
                            {product.isBestSeller ? 'Remove from Best Sellers' : 'Mark as Best Seller'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'create-product' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Imported Product</h2>
                <p className="text-gray-600">
                  As an admin, you can list imported products. Check the "Mark as Imported Product" checkbox when creating the product.
                </p>
              </div>
              <ProductListingForm onSuccess={() => {
                setActiveTab('products');
                loadProducts();
              }} />
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              {/* Order Statistics */}
              {orderStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Total Orders</h3>
                    <p className="text-2xl font-bold text-gray-900">{orderStats.totalOrders || 0}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Total Revenue</h3>
                    <p className="text-2xl font-bold text-[#16A34A]">ETB {(orderStats.totalRevenue || 0).toLocaleString()}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Pending Payment</h3>
                    <p className="text-2xl font-bold text-orange-600">ETB {(orderStats.pendingPayment || 0).toLocaleString()}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Delivered Orders</h3>
                    <p className="text-2xl font-bold text-green-600">{orderStats.deliveredOrders || 0}</p>
                  </div>
                </div>
              )}

              {/* Filters */}
              <div className="mb-4 flex flex-wrap gap-4">
                <input
                  type="text"
                  placeholder="Search by Order ID, Customer Name, or Email..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      setCurrentPage(1);
                      loadOrders();
                    }
                  }}
                  className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#16A34A] focus:border-[#16A34A]"
                />
                <select
                  value={orderStatusFilter}
                  onChange={(e) => {
                    setOrderStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#16A34A] focus:border-[#16A34A]"
                >
                  <option value="">All Order Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <select
                  value={paymentStatusFilter}
                  onChange={(e) => {
                    setPaymentStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#16A34A] focus:border-[#16A34A]"
                >
                  <option value="">All Payment Status</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
                <button
                  onClick={() => {
                    setCurrentPage(1);
                    loadOrders();
                  }}
                  className="px-6 py-2 bg-[#16A34A] text-white rounded-md hover:bg-[#15803D]"
                >
                  Search
                </button>
                {(searchTerm || orderStatusFilter || paymentStatusFilter) && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setOrderStatusFilter('');
                      setPaymentStatusFilter('');
                      setCurrentPage(1);
                      loadOrders();
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Orders Table */}
              {loading ? (
                <div className="text-center py-12">Loading orders...</div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <div className="text-gray-500">No orders found</div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order) => (
                          <tr key={order._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                              {order._id.substring(0, 8)}...
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{order.user?.name || 'N/A'}</div>
                              <div className="text-sm text-gray-500">{order.user?.email || 'N/A'}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">
                                {order.items?.length || 0} item(s)
                              </div>
                              <div className="text-xs text-gray-500">
                                {order.items?.slice(0, 2).map((item: any) => item.product?.name || 'Product').join(', ')}
                                {order.items?.length > 2 ? '...' : ''}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              ETB {order.totalAmount?.toLocaleString() || '0'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                order.orderStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                                order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-800' :
                                order.orderStatus === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                order.orderStatus === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {order.orderStatus || 'pending'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                                order.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                                order.paymentStatus === 'refunded' ? 'bg-orange-100 text-orange-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {order.paymentStatus || 'pending'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <Link
                                to={`/orders/${order._id}`}
                                className="text-[#16A34A] hover:text-[#15803D]"
                              >
                                View Details
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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
                className="inline-block bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold py-3 px-6 rounded-lg transition-colors"
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

