import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { productsAPI, orderAPI } from '../utils/api';
import ProductListingForm from '../components/ProductListingForm';

const ProviderDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'list' | 'products' | 'orders'>('list');
  const [myProducts, setMyProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

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
    } else if (user && activeTab === 'orders') {
      loadMyOrders();
    }
  }, [user, activeTab, orderStatusFilter, paymentStatusFilter]);

  const loadMyProducts = async () => {
    setLoading(true);
    try {
      const response = await productsAPI.getAll({ limit: 100 });
      // Filter products by current user
      const userId = (user as any)?._id || user?.id;
      const filtered = (response.products || []).filter(
        (product: any) => {
          const sellerId = product.seller?._id || product.seller?.id || product.seller;
          return sellerId === userId;
        }
      );
      setMyProducts(filtered);
    } catch (error: any) {
      console.error('Error loading products:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMyOrders = async () => {
    setLoading(true);
    try {
      const response = await orderAPI.getSellerOrders({
        orderStatus: orderStatusFilter || undefined,
        paymentStatus: paymentStatusFilter || undefined,
        limit: 50
      });
      setOrders(response.orders || []);
    } catch (error: any) {
      console.error('Error loading orders:', error.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    if (!window.confirm(`Are you sure you want to change the order status to "${newStatus}"?`)) {
      return;
    }

    setUpdatingOrderId(orderId);
    try {
      await orderAPI.updateStatus(orderId, { orderStatus: newStatus });
      await loadMyOrders();
    } catch (error: any) {
      alert(error.message || 'Failed to update order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleConfirmOrder = async (orderId: string) => {
    await handleUpdateOrderStatus(orderId, 'processing');
  };

  const handleRejectOrder = async (orderId: string) => {
    await handleUpdateOrderStatus(orderId, 'cancelled');
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
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'rgba(249, 250, 251, 0.7)' }}>
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
                  ? 'border-[#16A34A] text-[#16A34A]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              List New Product
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'products'
                  ? 'border-[#16A34A] text-[#16A34A]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Products
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-4 px-1 border-b-2 font-medium text-sm relative ${
                activeTab === 'orders'
                  ? 'border-[#16A34A] text-[#16A34A]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Orders
              {orders.filter((o: any) => o.orderStatus === 'pending').length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {orders.filter((o: any) => o.orderStatus === 'pending').length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'list' && (
            <ProductListingForm 
              onSuccess={() => {
                loadMyProducts();
                setEditingProduct(null);
                setActiveTab('products');
              }} 
              product={editingProduct}
            />
          )}
          
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
                    className="bg-[#16A34A] text-white px-6 py-2 rounded-lg hover:bg-[#15803D]"
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
                        <p className="text-[#16A34A] font-bold text-xl mb-2">
                          ETB {product.price?.toLocaleString()}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                          <span>Stock: {product.stock || 0}</span>
                          <span className={`px-2 py-1 rounded ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {product.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingProduct(product);
                              setActiveTab('list');
                            }}
                            className="flex-1 bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={async () => {
                              if (window.confirm('Are you sure you want to delete this product?')) {
                                try {
                                  await productsAPI.delete(product._id);
                                  await loadMyProducts();
                                } catch (error: any) {
                                  alert(error.message || 'Failed to delete product');
                                }
                              }
                            }}
                            className="px-4 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition-colors"
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

          {activeTab === 'orders' && (
            <div>
              {/* Filters */}
              <div className="mb-4 flex flex-wrap gap-4">
                <select
                  value={orderStatusFilter}
                  onChange={(e) => {
                    setOrderStatusFilter(e.target.value);
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
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#16A34A] focus:border-[#16A34A]"
                >
                  <option value="">All Payment Status</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                </select>
                {(orderStatusFilter || paymentStatusFilter) && (
                  <button
                    onClick={() => {
                      setOrderStatusFilter('');
                      setPaymentStatusFilter('');
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Clear Filters
                  </button>
                )}
              </div>

              {/* Orders List */}
              {loading ? (
                <div className="text-center py-12">Loading orders...</div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <div className="text-gray-500">No orders found for your products.</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => {
                    // Get only items from this seller
                    const userId = (user as any)?._id?.toString() || user?.id?.toString();
                    const sellerItems = order.items.filter((item: any) => {
                      const sellerId = item.product?.seller?._id?.toString() || item.product?.seller?.id?.toString() || item.product?.seller?.toString();
                      return sellerId === userId;
                    });

                    const subtotal = sellerItems.reduce((sum: number, item: any) => 
                      sum + (item.price * item.quantity), 0
                    );

                    return (
                      <div key={order._id} className="bg-white rounded-lg shadow p-6">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          {/* Order Info */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                  Order #{order._id.substring(0, 8)}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <span className={`px-3 py-1 text-xs rounded-full ${
                                  order.orderStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                                  order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-800' :
                                  order.orderStatus === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                  order.orderStatus === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {order.orderStatus}
                                </span>
                                <span className={`px-3 py-1 text-xs rounded-full ${
                                  order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                                  order.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {order.paymentStatus}
                                </span>
                              </div>
                            </div>

                            <div className="mb-4">
                              <p className="text-sm text-gray-600 mb-1">
                                <strong>Customer:</strong> {order.user?.name || 'N/A'}
                              </p>
                              <p className="text-sm text-gray-600 mb-1">
                                <strong>Email:</strong> {order.user?.email || 'N/A'}
                              </p>
                              <p className="text-sm text-gray-600">
                                <strong>Phone:</strong> {order.shippingAddress?.phone || 'N/A'}
                              </p>
                            </div>

                            <div className="mb-4">
                              <h4 className="text-sm font-semibold text-gray-900 mb-2">Your Products in This Order:</h4>
                              <div className="bg-gray-50 rounded p-3">
                                {sellerItems.map((item: any, idx: number) => (
                                  <div key={idx} className="text-sm text-gray-700 mb-1">
                                    {item.product?.name || 'Product'} x{item.quantity} - ETB {item.price.toLocaleString()} each
                                  </div>
                                ))}
                                <div className="mt-2 pt-2 border-t border-gray-200">
                                  <strong className="text-[#16A34A]">Subtotal: ETB {subtotal.toLocaleString()}</strong>
                                </div>
                              </div>
                            </div>

                            <div className="mb-4">
                              <h4 className="text-sm font-semibold text-gray-900 mb-1">Shipping Address:</h4>
                              <p className="text-sm text-gray-600">
                                {order.shippingAddress?.street}<br />
                                {order.shippingAddress?.city}, {order.shippingAddress?.state}<br />
                                {order.shippingAddress?.zipCode}, {order.shippingAddress?.country}
                              </p>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col gap-2 min-w-[200px]">
                            {order.orderStatus === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleConfirmOrder(order._id)}
                                  disabled={updatingOrderId === order._id}
                                  className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {updatingOrderId === order._id ? 'Processing...' : 'Confirm Order'}
                                </button>
                                <button
                                  onClick={() => handleRejectOrder(order._id)}
                                  disabled={updatingOrderId === order._id}
                                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Reject Order
                                </button>
                              </>
                            )}
                            {order.orderStatus === 'processing' && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order._id, 'shipped')}
                                disabled={updatingOrderId === order._id}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {updatingOrderId === order._id ? 'Updating...' : 'Mark as Shipped'}
                              </button>
                            )}
                            {order.orderStatus === 'shipped' && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order._id, 'delivered')}
                                disabled={updatingOrderId === order._id}
                                className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {updatingOrderId === order._id ? 'Updating...' : 'Mark as Delivered'}
                              </button>
                            )}
                            {order.trackingNumber && (
                              <p className="text-xs text-gray-500 mt-2">
                                Tracking: {order.trackingNumber}
                              </p>
                            )}
                            <Link
                              to={`/orders/${order._id}`}
                              className="text-center text-[#16A34A] hover:text-[#15803D] text-sm font-medium"
                            >
                              View Full Details →
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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




