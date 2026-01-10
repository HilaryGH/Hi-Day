import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orderAPI, cartAPI } from '../utils/api';

interface CheckoutItem {
  productId: string;
  quantity: number;
  productName?: string;
  price?: number;
  image?: string;
}

const Checkout = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get product data from location state (for Buy Now) or cart (for cart checkout)
  const directProduct = location.state?.product as any;
  const fromCart = location.state?.fromCart === true;

  const [items, setItems] = useState<CheckoutItem[]>([]);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Ethiopia',
    phone: '',
    paymentMethod: 'cash_on_delivery',
    shippingCost: 0,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    if (user) {
      loadCheckoutData();
    }
  }, [user, authLoading, directProduct, fromCart]);

  const loadCheckoutData = async () => {
    if (directProduct && !fromCart) {
      // Direct purchase from product page
      setItems([{
        productId: directProduct._id,
        quantity: directProduct.quantity || 1,
        productName: directProduct.name,
        price: directProduct.price,
        image: directProduct.images?.[0]
      }]);
    } else {
      // Load from cart
      try {
        setLoading(true);
        const cart = await cartAPI.get();
        if (!cart || !cart.items || cart.items.length === 0) {
          navigate('/cart');
          return;
        }
        setCartItems(cart.items);
        const checkoutItems = cart.items.map((item: any) => ({
          productId: item.product._id,
          quantity: item.quantity,
          productName: item.product.name,
          price: item.product.price,
          image: item.product.images?.[0]
        }));
        setItems(checkoutItems);
      } catch (error: any) {
        setError('Failed to load cart items');
        navigate('/cart');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const calculateSubtotal = () => {
    return items.reduce((total, item) => total + (item.price || 0) * item.quantity, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + formData.shippingCost;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    // Validation
    if (!formData.street.trim()) {
      setError('Street address is required');
      setSubmitting(false);
      return;
    }
    if (!formData.city.trim()) {
      setError('City is required');
      setSubmitting(false);
      return;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      setSubmitting(false);
      return;
    }

    try {
      const orderData: any = {
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        shippingAddress: {
          street: formData.street.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          zipCode: formData.zipCode.trim(),
          country: formData.country,
          phone: formData.phone.trim()
        },
        paymentMethod: formData.paymentMethod,
        shippingCost: formData.shippingCost,
        useCart: fromCart
      };

      const response = await orderAPI.create(orderData);
      
      // Navigate to order confirmation page
      const orderId = response.order?._id || response.order?.id || response._id || response.id;
      if (orderId) {
        navigate(`/orders/${orderId}`, { 
          state: { 
            order: response.order || response,
            success: true 
          } 
        });
      } else {
        // Fallback: show success message and redirect to products
        alert('Order placed successfully!');
        navigate('/products');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563EB]"></div>
          <p className="mt-4 text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!user || items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Address */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Shipping Address</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="street"
                      name="street"
                      type="text"
                      required
                      value={formData.street}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#2563EB] focus:border-[#2563EB]"
                      placeholder="Street name and house number"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="city"
                        name="city"
                        type="text"
                        required
                        value={formData.city}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#2563EB] focus:border-[#2563EB]"
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                        State/Region
                      </label>
                      <input
                        id="state"
                        name="state"
                        type="text"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#2563EB] focus:border-[#2563EB]"
                        placeholder="State or Region"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP/Postal Code
                      </label>
                      <input
                        id="zipCode"
                        name="zipCode"
                        type="text"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#2563EB] focus:border-[#2563EB]"
                        placeholder="Postal code"
                      />
                    </div>
                    <div>
                      <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <input
                        id="country"
                        name="country"
                        type="text"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#2563EB] focus:border-[#2563EB]"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#2563EB] focus:border-[#2563EB]"
                      placeholder="+251 9X XXX XXXX"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Method</h2>
                <div className="space-y-3">
                  {[
                    { value: 'cash_on_delivery', label: 'Cash on Delivery', desc: 'Pay when you receive your order' },
                    { value: 'mobile_money', label: 'Mobile Money', desc: 'M-Pesa, Telebirr, or other mobile payment' },
                    { value: 'bank_transfer', label: 'Bank Transfer', desc: 'Direct bank transfer' },
                    { value: 'card', label: 'Card Payment', desc: 'Credit or debit card' }
                  ].map((method) => (
                    <label
                      key={method.value}
                      className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.paymentMethod === method.value
                          ? 'border-[#2563EB] bg-[#2563EB]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.value}
                        checked={formData.paymentMethod === method.value}
                        onChange={handleInputChange}
                        className="mt-1 h-4 w-4 text-[#2563EB] focus:ring-[#2563EB]"
                      />
                      <div className="ml-3 flex-1">
                        <div className="font-medium text-gray-900">{method.label}</div>
                        <div className="text-sm text-gray-500">{method.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
                
                {/* Order Items */}
                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {items.map((item, index) => (
                    <div key={index} className="flex gap-3 pb-3 border-b border-gray-200">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 line-clamp-2">
                          {item.productName || 'Product'}
                        </p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        <p className="text-sm font-semibold text-[#2563EB] mt-1">
                          ETB {((item.price || 0) * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pricing Breakdown */}
                <div className="space-y-3 mb-6 border-t pt-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>ETB {calculateSubtotal().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>ETB {formData.shippingCost.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-[#2563EB]">ETB {calculateTotal().toLocaleString()}</span>
                  </div>
                </div>

                {/* Shipping Cost Input */}
                <div className="mb-6">
                  <label htmlFor="shippingCost" className="block text-sm font-medium text-gray-700 mb-1">
                    Shipping Cost (ETB)
                  </label>
                  <input
                    id="shippingCost"
                    name="shippingCost"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.shippingCost}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#2563EB] focus:border-[#2563EB]"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Processing Order...' : 'Place Order'}
                </button>

                <Link
                  to={fromCart ? '/cart' : '/products'}
                  className="block text-center mt-4 text-sm text-gray-600 hover:text-[#2563EB]"
                >
                  {fromCart ? '← Back to Cart' : '← Continue Shopping'}
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;

