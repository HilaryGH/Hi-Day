import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orderAPI } from '../utils/api';

const OrderConfirmation = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<any>(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }

    if (id && !order) {
      loadOrder();
    }
  }, [id, user, authLoading]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const data = await orderAPI.getOne(id!);
      setOrder(data);
    } catch (error: any) {
      console.error('Error loading order:', error);
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#16A34A]"></div>
          <p className="mt-4 text-gray-600">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Order not found</p>
          <Link
            to="/products"
            className="inline-block bg-[#16A34A] text-white px-6 py-3 rounded-lg hover:bg-[#15803D]"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'rgba(249, 250, 251, 0.7)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-green-900 mb-1">Order Confirmed!</h1>
              <p className="text-green-700">
                Your order has been successfully placed. 
                {order.orderNumber && (
                  <span className="font-semibold"> Order Number: {order.orderNumber}</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="bg-[#16A34A] text-white px-6 py-4">
            <h2 className="text-xl font-bold">Order Details</h2>
            <p className="text-sm text-blue-100 mt-1">
              {order.orderNumber ? `Order #${order.orderNumber}` : `Order #${order._id.slice(-8).toUpperCase()}`}
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* Order Items */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Order Items</h3>
              <div className="space-y-4">
                {order.items && order.items.map((item: any, index: number) => (
                  <div key={index} className="flex gap-4 pb-4 border-b border-gray-200">
                    {item.product && item.product.images && item.product.images[0] && (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{item.product?.name || 'Product'}</h4>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      <p className="text-lg font-bold text-[#16A34A] mt-1">
                        ETB {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Shipping Address</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">{order.shippingAddress?.street}</p>
                <p className="text-gray-700">
                  {order.shippingAddress?.city}
                  {order.shippingAddress?.state && `, ${order.shippingAddress.state}`}
                  {order.shippingAddress?.zipCode && ` ${order.shippingAddress.zipCode}`}
                </p>
                <p className="text-gray-700">{order.shippingAddress?.country}</p>
                <p className="text-gray-700 mt-2">Phone: {order.shippingAddress?.phone}</p>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Method</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 capitalize font-semibold mb-2">
                  {order.paymentMethod?.replace(/_/g, ' ').replace('cbe', 'CBE').replace('telebirr', 'Telebirr')}
                </p>
                {order.paymentMethod === 'cbe_bank_transfer' && (
                  <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                    <p className="text-sm font-semibold text-gray-900 mb-2">Payment Details:</p>
                    <p className="text-sm text-gray-700">Bank: Commercial Bank of Ethiopia (CBE)</p>
                    <p className="text-sm text-gray-700">Account Number: <span className="font-mono font-semibold">1000140713949</span></p>
                    <p className="text-sm text-gray-700">Account Name: <span className="font-semibold">Hilary Gebremedhn</span></p>
                  </div>
                )}
                {order.paymentMethod === 'telebirr' && (
                  <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                    <p className="text-sm font-semibold text-gray-900 mb-2">Payment Details:</p>
                    <p className="text-sm text-gray-700">Phone Number: <span className="font-mono font-semibold">+251989834889</span></p>
                    <p className="text-sm text-gray-700">Account Name: <span className="font-semibold">Hilary Gebremedhn</span></p>
                  </div>
                )}
                <p className="text-sm text-gray-500 mt-3">
                  Status: <span className="capitalize font-semibold">{order.paymentStatus}</span>
                </p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="border-t pt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>ETB {(order.totalAmount - (order.shippingCost || 0)).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>ETB {(order.shippingCost || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-2 border-t">
                  <span>Total</span>
                  <span className="text-[#16A34A]">ETB {order.totalAmount?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Order Status */}
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Order Status</p>
              <p className="text-lg font-semibold text-[#16A34A] capitalize">
                {order.orderStatus}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <Link
            to="/products"
            className="inline-block bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            Continue Shopping
          </Link>
          <Link
            to={`/orders/${order._id}`}
            className="inline-block border-2 border-[#16A34A] text-[#16A34A] hover:bg-[#16A34A] hover:text-white font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            View Order
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;




