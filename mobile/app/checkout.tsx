import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image as ExpoImage } from 'expo-image';
import { useAuth } from '@/context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { orderAPI, cartAPI } from '@/utils/api';

interface CheckoutItem {
  productId: string;
  quantity: number;
  productName?: string;
  price?: number;
  image?: string;
}

const Checkout = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { user, loading: authLoading } = useAuth();

  const directProduct = params.product ? JSON.parse(params.product as string) : null;
  const fromCart = params.fromCart === 'true';

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
    shippingCost: 200,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
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
        productId: directProduct._id || directProduct.id,
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
          router.back();
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
        router.back();
      } finally {
        setLoading(false);
      }
    }
  };

  const handleInputChange = (name: string, value: string) => {
    if (name === 'shippingCost') {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((total, item) => total + (item.price || 0) * item.quantity, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + formData.shippingCost;
  };

  const handleSubmit = async () => {
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
        router.replace({
          pathname: '/order-confirmation',
          params: { 
            orderId,
            order: JSON.stringify(response.order || response)
          }
        });
      } else {
        Alert.alert('Success', 'Order placed successfully!', [
          { text: 'OK', onPress: () => router.replace('/(tabs)') }
        ]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#16A34A" />
        <Text style={styles.loadingText}>Loading checkout...</Text>
      </View>
    );
  }

  if (!user || items.length === 0) {
    return null;
  }

  const paymentMethods = [
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
        phoneNumber: '0943056001',
        accountName: 'Hilary Gebremedhn'
      }
    },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={insets.top}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Checkout</Text>
          <View style={{ width: 60 }} />
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Shipping Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Street Address *"
            value={formData.street}
            onChangeText={(value) => handleInputChange('street', value)}
            placeholderTextColor="#9CA3AF"
          />

          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="City *"
              value={formData.city}
              onChangeText={(value) => handleInputChange('city', value)}
              placeholderTextColor="#9CA3AF"
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="State/Region"
              value={formData.state}
              onChangeText={(value) => handleInputChange('state', value)}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="ZIP/Postal Code"
              value={formData.zipCode}
              onChangeText={(value) => handleInputChange('zipCode', value)}
              placeholderTextColor="#9CA3AF"
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Country"
              value={formData.country}
              onChangeText={(value) => handleInputChange('country', value)}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <TextInput
            style={styles.input}
            placeholder="Phone Number *"
            value={formData.phone}
            onChangeText={(value) => handleInputChange('phone', value)}
            keyboardType="phone-pad"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.value}
              style={[
                styles.paymentOption,
                formData.paymentMethod === method.value && styles.paymentOptionSelected,
                !method.available && styles.paymentOptionDisabled
              ]}
              onPress={() => method.available && handleInputChange('paymentMethod', method.value)}
              disabled={!method.available}
            >
              <View style={styles.paymentOptionContent}>
                <View style={styles.radioContainer}>
                  <View style={[
                    styles.radio,
                    formData.paymentMethod === method.value && styles.radioSelected
                  ]} />
                </View>
                <View style={styles.paymentOptionText}>
                  <Text style={styles.paymentOptionLabel}>
                    {method.label}
                    {!method.available && <Text style={styles.comingSoon}> (Coming Soon)</Text>}
                  </Text>
                  <Text style={styles.paymentOptionDesc}>{method.desc}</Text>
                  {method.available && method.details && formData.paymentMethod === method.value && (
                    <View style={styles.paymentDetails}>
                      {method.value === 'cbe_bank_transfer' && (
                        <>
                          <Text style={styles.paymentDetailsTitle}>Bank Transfer Details:</Text>
                          <Text style={styles.paymentDetailsText}>Bank: Commercial Bank of Ethiopia (CBE)</Text>
                          <Text style={styles.paymentDetailsText}>
                            Account Number: <Text style={styles.paymentDetailsBold}>{method.details.accountNumber}</Text>
                          </Text>
                          <Text style={styles.paymentDetailsText}>
                            Account Name: <Text style={styles.paymentDetailsBold}>{method.details.accountName}</Text>
                          </Text>
                        </>
                      )}
                      {method.value === 'telebirr' && (
                        <>
                          <Text style={styles.paymentDetailsTitle}>Telebirr Transfer Details:</Text>
                          <Text style={styles.paymentDetailsText}>
                            Phone Number: <Text style={styles.paymentDetailsBold}>{method.details.phoneNumber}</Text>
                          </Text>
                          <Text style={styles.paymentDetailsText}>
                            Account Name: <Text style={styles.paymentDetailsBold}>{method.details.accountName}</Text>
                          </Text>
                        </>
                      )}
                      <View style={styles.paymentWarning}>
                        <Text style={styles.paymentWarningText}>
                          ⚠️ Please transfer 200 ETB as initial payment for delivery
                        </Text>
                        <Text style={styles.paymentWarningText}>
                          After payment, send screenshot to: 📱 @da_hi market place
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          
          {items.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              {item.image && (
                <ExpoImage
                  source={{ uri: item.image }}
                  style={styles.orderItemImage}
                  contentFit="cover"
                  placeholder={require('@/assets/images/icon.png')}
                />
              )}
              <View style={styles.orderItemDetails}>
                <Text style={styles.orderItemName} numberOfLines={2}>
                  {item.productName || 'Product'}
                </Text>
                <Text style={styles.orderItemQty}>Qty: {item.quantity}</Text>
                <Text style={styles.orderItemPrice}>
                  ETB {((item.price || 0) * item.quantity).toLocaleString()}
                </Text>
              </View>
            </View>
          ))}

          <View style={styles.pricingBreakdown}>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Subtotal</Text>
              <Text style={styles.pricingValue}>ETB {calculateSubtotal().toLocaleString()}</Text>
            </View>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Shipping</Text>
              <Text style={styles.pricingValue}>ETB {formData.shippingCost.toLocaleString()}</Text>
            </View>
            <View style={styles.pricingRowTotal}>
              <Text style={styles.pricingLabelTotal}>Total</Text>
              <Text style={styles.pricingValueTotal}>ETB {calculateTotal().toLocaleString()}</Text>
            </View>
          </View>

          <View style={styles.shippingCostInput}>
            <Text style={styles.inputLabel}>Delivery Fee (ETB)</Text>
            <TextInput
              style={styles.input}
              placeholder="200"
              value={formData.shippingCost.toString()}
              onChangeText={(value) => handleInputChange('shippingCost', value)}
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />
            <Text style={styles.inputHint}>Standard delivery fee: 200 ETB</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Place Order</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingTop: 8,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#16A34A',
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  paymentOption: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  paymentOptionSelected: {
    borderColor: '#16A34A',
    backgroundColor: '#F0FDF4',
  },
  paymentOptionDisabled: {
    opacity: 0.6,
    backgroundColor: '#F9FAFB',
  },
  paymentOptionContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  radioContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  radioSelected: {
    borderColor: '#16A34A',
    backgroundColor: '#16A34A',
  },
  paymentOptionText: {
    flex: 1,
  },
  paymentOptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  comingSoon: {
    fontSize: 12,
    color: '#F59E0B',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  paymentOptionDesc: {
    fontSize: 14,
    color: '#6B7280',
  },
  paymentDetails: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  paymentDetailsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  paymentDetailsText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  paymentDetailsBold: {
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  paymentWarning: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  paymentWarningText: {
    fontSize: 12,
    color: '#92400E',
    marginBottom: 4,
  },
  orderItem: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  orderItemImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
  },
  orderItemDetails: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  orderItemQty: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16A34A',
  },
  pricingBreakdown: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  pricingRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  pricingLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  pricingValue: {
    fontSize: 14,
    color: '#6B7280',
  },
  pricingLabelTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  pricingValueTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#16A34A',
  },
  shippingCostInput: {
    marginTop: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  inputHint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#16A34A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
});

export default Checkout;
