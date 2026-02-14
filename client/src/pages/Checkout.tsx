import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orderAPI, cartAPI } from '../utils/api';

// Declare Google Maps types
declare global {
  interface Window {
    google?: any;
    initMap?: () => void;
  }
}

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
    shippingCost: 200, // Default, will be calculated
    latitude: null as number | null,
    longitude: null as number | null,
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

  const autocompleteRef = useRef<HTMLInputElement>(null);
  const autocompleteInstanceRef = useRef<any>(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);

  // Load Google Maps script and initialize autocomplete
  useEffect(() => {
    let checkInterval: ReturnType<typeof setInterval> | null = null;

    const initializeAutocomplete = () => {
      if (!autocompleteRef.current) {
        // Retry if input is not ready yet
        setTimeout(() => {
          if (window.google && window.google.maps && window.google.maps.places) {
            initializeAutocomplete();
          }
        }, 200);
        return;
      }
      
      if (window.google && window.google.maps && window.google.maps.places) {
        // Clean up existing autocomplete if any
        if (autocompleteInstanceRef.current) {
          try {
            window.google.maps.event.clearInstanceListeners(autocompleteInstanceRef.current);
          } catch (e) {
            // Ignore cleanup errors
          }
        }

        try {
          const autocompleteInstance = new window.google.maps.places.Autocomplete(
            autocompleteRef.current,
            {
              componentRestrictions: { country: 'et' }, // Restrict to Ethiopia
              fields: ['formatted_address', 'geometry', 'address_components', 'name'],
              types: ['geocode', 'establishment'] // Allow both addresses and places
            }
          );

          autocompleteInstance.addListener('place_changed', () => {
            const place = autocompleteInstance.getPlace();
            if (place.geometry) {
              const lat = place.geometry.location.lat();
              const lng = place.geometry.location.lng();
              
              // Extract address components
              let street = '';
              let city = '';
              let state = '';
              let zipCode = '';

              if (place.address_components) {
                place.address_components.forEach((component: any) => {
                  const types = component.types;
                  if (types.includes('street_number') || types.includes('route')) {
                    street += (street ? ' ' : '') + component.long_name;
                  }
                  if (types.includes('locality') || types.includes('administrative_area_level_2')) {
                    city = component.long_name;
                  }
                  if (types.includes('administrative_area_level_1')) {
                    state = component.long_name;
                  }
                  if (types.includes('postal_code')) {
                    zipCode = component.long_name;
                  }
                });
              }

              setFormData(prev => ({
                ...prev,
                street: street || place.name || place.formatted_address || prev.street,
                city: city || prev.city,
                state: state || prev.state,
                zipCode: zipCode || prev.zipCode,
                latitude: lat,
                longitude: lng
              }));

              // Recalculate delivery fee after location is set
              setTimeout(() => {
                calculateDeliveryFee();
              }, 500);
            }
          });

          autocompleteInstanceRef.current = autocompleteInstance;
          setMapsLoaded(true);
          console.log('✅ Google Maps Autocomplete initialized successfully');
        } catch (error) {
          console.error('❌ Error initializing autocomplete:', error);
          setMapsLoaded(false);
        }
      } else {
        setMapsLoaded(false);
      }
    };

    // Check if Google Maps is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      // Small delay to ensure input is rendered
      setTimeout(() => {
        initializeAutocomplete();
      }, 100);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      // Wait for script to load
      checkInterval = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
          if (checkInterval) clearInterval(checkInterval);
          setTimeout(() => {
            initializeAutocomplete();
          }, 100);
        }
      }, 100);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        if (checkInterval) clearInterval(checkInterval);
        if (!window.google || !window.google.maps) {
          console.warn('⚠️ Google Maps API failed to load. Autocomplete will not work. Make sure VITE_GOOGLE_MAPS_API_KEY is set in your .env file.');
        }
      }, 10000);
      
      return;
    }

    // Load Google Maps script
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ Google Maps API key not found. Autocomplete will not work. Add VITE_GOOGLE_MAPS_API_KEY to your .env file.');
      return;
    }

    console.log('🔄 Loading Google Maps API...');
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('✅ Google Maps API loaded');
      // Wait a bit for Google Maps to fully initialize
      setTimeout(() => {
        initializeAutocomplete();
      }, 200);
    };
    
    script.onerror = () => {
      console.error('❌ Failed to load Google Maps API. Check your API key and network connection.');
      setMapsLoaded(false);
    };
    
    document.head.appendChild(script);

    // Cleanup
    return () => {
      if (checkInterval) {
        clearInterval(checkInterval);
      }
      if (autocompleteInstanceRef.current) {
        try {
          window.google?.maps?.event?.clearInstanceListeners(autocompleteInstanceRef.current);
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, []);

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          setFormData(prev => ({
            ...prev,
            latitude: lat,
            longitude: lng
          }));

          // Reverse geocode to get address
          if (window.google && window.google.maps) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results: any[], status: string) => {
              if (status === 'OK' && results[0]) {
                const place = results[0];
                let street = '';
                let city = '';
                let state = '';
                let zipCode = '';

                place.address_components.forEach((component: any) => {
                  const types = component.types;
                  if (types.includes('street_number') || types.includes('route')) {
                    street += (street ? ' ' : '') + component.long_name;
                  }
                  if (types.includes('locality') || types.includes('administrative_area_level_2')) {
                    city = component.long_name;
                  }
                  if (types.includes('administrative_area_level_1')) {
                    state = component.long_name;
                  }
                  if (types.includes('postal_code')) {
                    zipCode = component.long_name;
                  }
                });

                setFormData(prev => ({
                  ...prev,
                  street: street || place.formatted_address,
                  city: city || prev.city,
                  state: state || prev.state,
                  zipCode: zipCode || prev.zipCode
                }));

                setTimeout(() => {
                  calculateDeliveryFee();
                }, 500);
              }
            });
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please enter address manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const calculateDeliveryFee = async () => {
    if (!formData.city.trim() || !formData.street.trim() || items.length === 0) {
      return;
    }

    try {
      const productIds = items.map(item => item.productId);
      const deliveryFeeResponse = await orderAPI.calculateDeliveryFee({
        shippingAddress: {
          city: formData.city,
          street: formData.street,
          state: formData.state,
          zipCode: formData.zipCode,
          latitude: formData.latitude,
          longitude: formData.longitude
        },
        productIds
      });
      
      if (deliveryFeeResponse.deliveryFee) {
        setFormData(prev => ({ ...prev, shippingCost: deliveryFeeResponse.deliveryFee }));
      }
    } catch (error) {
      console.error('Error calculating delivery fee:', error);
      // Keep default fee on error
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Recalculate delivery fee when city or street changes
    if (name === 'city' || name === 'street') {
      // Debounce the calculation
      setTimeout(() => {
        calculateDeliveryFee();
      }, 500);
    }
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
          phone: formData.phone.trim(),
          latitude: formData.latitude,
          longitude: formData.longitude
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
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#16A34A]"></div>
          <p className="mt-4 text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!user || items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'rgba(249, 250, 251, 0.7)' }}>
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
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                        Street Address <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={getCurrentLocation}
                        className="text-xs text-[#16A34A] hover:text-[#15803D] font-medium flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Use Current Location
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        ref={autocompleteRef}
                        id="street"
                        name="street"
                        type="text"
                        required
                        value={formData.street}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#16A34A] focus:border-[#16A34A]"
                        placeholder="Start typing your address (e.g., Bole, Addis Ababa)"
                        autoComplete="off"
                      />
                      {mapsLoaded && (
                        <div className="absolute right-3 top-3 text-green-500">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {formData.latitude && formData.longitude 
                        ? `📍 Location set: ${formData.latitude.toFixed(6)}, ${formData.longitude.toFixed(6)}`
                        : mapsLoaded 
                          ? '💡 Start typing to see address suggestions (e.g., Bole, Addis Ababa)'
                          : '💡 Tip: Use "Use Current Location" or enter your address manually'}
                    </p>
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
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#16A34A] focus:border-[#16A34A]"
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
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#16A34A] focus:border-[#16A34A]"
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
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#16A34A] focus:border-[#16A34A]"
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
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#16A34A] focus:border-[#16A34A]"
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
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#16A34A] focus:border-[#16A34A]"
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
                    { 
                      value: 'cash_on_delivery', 
                      label: 'Cash on Delivery', 
                      desc: 'Pay when you receive your order',
                      available: true
                    },
                    { 
                      value: 'cbe_bank_transfer', 
                      label: 'CBE Bank Transfer', 
                      desc: 'Commercial Bank of Ethiopia',
                      available: true,
                      details: {
                        accountNumber: '1000140713949',
                        accountName: 'Hilary Gebremedhn'
                      }
                    },
                    { 
                      value: 'telebirr', 
                      label: 'Telebirr Transfer', 
                      desc: 'Mobile money transfer',
                      available: true,
                      details: {
                        phoneNumber: '+251989834889',
                        accountName: 'Hilary Gebremedhn'
                      }
                    },
                    { 
                      value: 'mobile_money', 
                      label: 'Other Mobile Money', 
                      desc: 'M-Pesa and other mobile payment methods',
                      available: false
                    },
                    { 
                      value: 'bank_transfer', 
                      label: 'Other Bank Transfer', 
                      desc: 'Other bank transfer methods',
                      available: false
                    },
                    { 
                      value: 'card', 
                      label: 'Card Payment', 
                      desc: 'Credit or debit card',
                      available: false
                    }
                  ].map((method) => (
                    <div key={method.value}>
                      <label
                        className={`flex items-start p-4 border-2 rounded-lg transition-all ${
                          method.available
                            ? formData.paymentMethod === method.value
                              ? 'border-[#16A34A] bg-[#16A34A]/5 cursor-pointer'
                              : 'border-gray-200 hover:border-gray-300 cursor-pointer'
                            : 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.value}
                          checked={formData.paymentMethod === method.value}
                          onChange={handleInputChange}
                          disabled={!method.available}
                          className="mt-1 h-4 w-4 text-[#16A34A] focus:ring-[#16A34A] disabled:opacity-50"
                        />
                        <div className="ml-3 flex-1">
                          <div className="font-medium text-gray-900 flex items-center gap-2">
                            {method.label}
                            {!method.available && (
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">Coming Soon</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{method.desc}</div>
                          {method.available && method.details && formData.paymentMethod === method.value && (
                            <div className="mt-3 p-3 bg-[#16A34A]/10 rounded-lg border border-[#16A34A]/20">
                              {method.value === 'cbe_bank_transfer' && (
                                <>
                                  <p className="text-sm font-semibold text-gray-900 mb-2">Bank Transfer Details:</p>
                                  <p className="text-sm text-gray-700">Bank: Commercial Bank of Ethiopia (CBE)</p>
                                  <p className="text-sm text-gray-700">Account Number: <span className="font-mono font-semibold">{method.details.accountNumber}</span></p>
                                  <p className="text-sm text-gray-700">Account Name: <span className="font-semibold">{method.details.accountName}</span></p>
                                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                                    <p className="text-sm font-semibold text-yellow-900 mb-1">⚠️ Important Payment Instructions:</p>
                                    <p className="text-sm text-yellow-800">• Please transfer <span className="font-bold">200 ETB</span> as initial payment for delivery</p>
                                    <p className="text-sm text-yellow-800">• After payment, send screenshot or receipt to our Telegram account:</p>
                                    <p className="text-sm text-yellow-800 font-semibold">📱 @da_hi market place</p>
                                    <p className="text-sm text-yellow-800 mt-1">• Your order will be processed after we receive your payment confirmation</p>
                                  </div>
                                </>
                              )}
                              {method.value === 'telebirr' && (
                                <>
                                  <p className="text-sm font-semibold text-gray-900 mb-2">Telebirr Transfer Details:</p>
                                  <p className="text-sm text-gray-700">Phone Number: <span className="font-mono font-semibold">{method.details.phoneNumber}</span></p>
                                  <p className="text-sm text-gray-700">Account Name: <span className="font-semibold">{method.details.accountName}</span></p>
                                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                                    <p className="text-sm font-semibold text-yellow-900 mb-1">⚠️ Important Payment Instructions:</p>
                                    <p className="text-sm text-yellow-800">• Please transfer <span className="font-bold">200 ETB</span> as initial payment for delivery</p>
                                    <p className="text-sm text-yellow-800">• After payment, send screenshot or receipt to our Telegram account:</p>
                                    <p className="text-sm text-yellow-800 font-semibold">📱 @da_hi market place</p>
                                    <p className="text-sm text-yellow-800 mt-1">• Your order will be processed after we receive your payment confirmation</p>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </label>
                    </div>
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
                        <p className="text-sm font-semibold text-[#16A34A] mt-1">
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
                    <span className="text-[#16A34A]">ETB {calculateTotal().toLocaleString()}</span>
                  </div>
                </div>

                {/* Shipping Cost Input */}
                <div className="mb-6">
                  <label htmlFor="shippingCost" className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Fee (ETB)
                  </label>
                  <input
                    id="shippingCost"
                    name="shippingCost"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.shippingCost}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#16A34A] focus:border-[#16A34A]"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Delivery fee based on distance: 0-5 km (200 ETB), 5-10 km (300 ETB), 10+ km (400 ETB)
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Processing Order...' : 'Place Order'}
                </button>

                <Link
                  to={fromCart ? '/cart' : '/products'}
                  className="block text-center mt-4 text-sm text-gray-600 hover:text-[#16A34A]"
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

