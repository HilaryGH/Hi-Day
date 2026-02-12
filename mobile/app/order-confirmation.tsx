import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image as ExpoImage } from 'expo-image';
import { useAuth } from '@/context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { orderAPI } from '@/utils/api';

const OrderConfirmation = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { user, loading: authLoading } = useAuth();

  const [order, setOrder] = useState<any>(params.order ? JSON.parse(params.order as string) : null);
  const [loading, setLoading] = useState(!params.order);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
      return;
    }

    if (params.orderId && !order) {
      loadOrder();
    }
  }, [params.orderId, user, authLoading]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const data = await orderAPI.getOne(params.orderId as string);
      setOrder(data);
    } catch (error: any) {
      console.error('Error loading order:', error);
      router.replace('/(tabs)');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#16A34A" />
        <Text style={styles.loadingText}>Loading order...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Order not found</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.buttonText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Success Message */}
      <View style={styles.successContainer}>
        <View style={styles.successIcon}>
          <Text style={styles.successIconText}>✓</Text>
        </View>
        <Text style={styles.successTitle}>Order Confirmed!</Text>
        <Text style={styles.successText}>
          Your order has been successfully placed.
          {order.orderNumber && (
            <Text style={styles.orderNumber}> Order Number: {order.orderNumber}</Text>
          )}
        </Text>
      </View>

      {/* Order Details */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Order Details</Text>
          <Text style={styles.cardSubtitle}>
            {order.orderNumber ? `Order #${order.orderNumber}` : `Order #${order._id?.slice(-8).toUpperCase()}`}
          </Text>
        </View>

        <View style={styles.cardContent}>
          {/* Order Items */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Items</Text>
            {order.items && order.items.map((item: any, index: number) => (
              <View key={index} style={styles.orderItem}>
                {item.product && item.product.images && item.product.images[0] && (
                  <ExpoImage
                    source={{ uri: item.product.images[0] }}
                    style={styles.orderItemImage}
                    contentFit="cover"
                    placeholder={require('@/assets/images/icon.png')}
                  />
                )}
                <View style={styles.orderItemDetails}>
                  <Text style={styles.orderItemName}>
                    {item.product?.name || 'Product'}
                  </Text>
                  <Text style={styles.orderItemQty}>Quantity: {item.quantity}</Text>
                  <Text style={styles.orderItemPrice}>
                    ETB {(item.price * item.quantity).toLocaleString()}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Shipping Address */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shipping Address</Text>
            <View style={styles.addressContainer}>
              <Text style={styles.addressText}>{order.shippingAddress?.street}</Text>
              <Text style={styles.addressText}>
                {order.shippingAddress?.city}
                {order.shippingAddress?.state && `, ${order.shippingAddress.state}`}
                {order.shippingAddress?.zipCode && ` ${order.shippingAddress.zipCode}`}
              </Text>
              <Text style={styles.addressText}>{order.shippingAddress?.country}</Text>
              <Text style={styles.addressText}>Phone: {order.shippingAddress?.phone}</Text>
            </View>
          </View>

          {/* Payment Method */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <View style={styles.paymentContainer}>
              <Text style={styles.paymentMethod}>
                {order.paymentMethod?.replace(/_/g, ' ').replace('cbe', 'CBE').replace('telebirr', 'Telebirr')}
              </Text>
              
              {order.paymentMethod === 'cbe_bank_transfer' && (
                <View style={styles.paymentDetails}>
                  <Text style={styles.paymentDetailsTitle}>Payment Details:</Text>
                  <Text style={styles.paymentDetailsText}>Bank: Commercial Bank of Ethiopia (CBE)</Text>
                  <Text style={styles.paymentDetailsText}>
                    Account Number: <Text style={styles.paymentDetailsBold}>1000140713949</Text>
                  </Text>
                  <Text style={styles.paymentDetailsText}>
                    Account Name: <Text style={styles.paymentDetailsBold}>Hilary Gebremedhn</Text>
                  </Text>
                </View>
              )}
              
              {order.paymentMethod === 'telebirr' && (
                <View style={styles.paymentDetails}>
                  <Text style={styles.paymentDetailsTitle}>Payment Details:</Text>
                  <Text style={styles.paymentDetailsText}>
                    Phone Number: <Text style={styles.paymentDetailsBold}>0943056001</Text>
                  </Text>
                  <Text style={styles.paymentDetailsText}>
                    Account Name: <Text style={styles.paymentDetailsBold}>Hilary Gebremedhn</Text>
                  </Text>
                </View>
              )}
              
              <Text style={styles.paymentStatus}>
                Status: <Text style={styles.paymentStatusBold}>{order.paymentStatus}</Text>
              </Text>
            </View>
          </View>

          {/* Order Summary */}
          <View style={styles.section}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>
                ETB {(order.totalAmount - (order.shippingCost || 0)).toLocaleString()}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryValue}>
                ETB {(order.shippingCost || 0).toLocaleString()}
              </Text>
            </View>
            <View style={styles.summaryRowTotal}>
              <Text style={styles.summaryLabelTotal}>Total</Text>
              <Text style={styles.summaryValueTotal}>
                ETB {order.totalAmount?.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Order Status */}
          <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>Order Status</Text>
            <Text style={styles.statusValue}>{order.orderStatus}</Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary]}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.buttonText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  successContainer: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  successIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  successIconText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#15803D',
    marginBottom: 8,
  },
  successText: {
    fontSize: 14,
    color: '#166534',
    textAlign: 'center',
  },
  orderNumber: {
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  cardHeader: {
    backgroundColor: '#16A34A',
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#D1FAE5',
  },
  cardContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
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
    width: 80,
    height: 80,
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#16A34A',
  },
  addressContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  addressText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  paymentContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  paymentMethod: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
    textTransform: 'capitalize',
  },
  paymentDetails: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  paymentDetailsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  paymentDetailsText: {
    fontSize: 12,
    color: '#374151',
    marginBottom: 4,
  },
  paymentDetailsBold: {
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  paymentStatus: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
  },
  paymentStatusBold: {
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryLabelTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  summaryValueTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#16A34A',
  },
  statusContainer: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  statusLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#16A34A',
    textTransform: 'capitalize',
  },
  actions: {
    marginTop: 8,
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#16A34A',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
});

export default OrderConfirmation;
