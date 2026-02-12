import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image as ExpoImage } from 'expo-image';
import { useAuth } from '@/context/AuthContext';
import { productsAPI, orderAPI } from '@/utils/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ProductListingForm from '@/components/ProductListingForm';

type TabType = 'list' | 'products' | 'orders';

const ProviderDashboard = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('list');
  const [myProducts, setMyProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    } else if (user && user.role !== 'product provider' && user.role !== 'seller' && user.role !== 'admin') {
      router.replace('/(tabs)');
    }
  }, [user, authLoading]);

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

  const handleRefresh = async () => {
    setRefreshing(true);
    if (activeTab === 'products') {
      await loadMyProducts();
    } else if (activeTab === 'orders') {
      await loadMyOrders();
    }
    setRefreshing(false);
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    Alert.alert(
      'Confirm Status Change',
      `Are you sure you want to change the order status to "${newStatus}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setUpdatingOrderId(orderId);
            try {
              await orderAPI.updateStatus(orderId, { orderStatus: newStatus });
              await loadMyOrders();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to update order status');
            } finally {
              setUpdatingOrderId(null);
            }
          },
        },
      ]
    );
  };

  const handleConfirmOrder = async (orderId: string) => {
    await handleUpdateOrderStatus(orderId, 'processing');
  };

  const handleRejectOrder = async (orderId: string) => {
    await handleUpdateOrderStatus(orderId, 'cancelled');
  };

  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#16A34A" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!user || (user.role !== 'product provider' && user.role !== 'seller' && user.role !== 'admin')) {
    return null;
  }

  const pendingOrdersCount = orders.filter((o: any) => o.orderStatus === 'pending').length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Provider Dashboard</Text>
        <Text style={styles.headerSubtitle}>
          Welcome back, {user.name}! Manage your products and listings.
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'list' && styles.tabActive]}
          onPress={() => setActiveTab('list')}
        >
          <Text style={[styles.tabText, activeTab === 'list' && styles.tabTextActive]}>
            List New Product
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'products' && styles.tabActive]}
          onPress={() => setActiveTab('products')}
        >
          <Text style={[styles.tabText, activeTab === 'products' && styles.tabTextActive]}>
            My Products
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'orders' && styles.tabActive]}
          onPress={() => setActiveTab('orders')}
        >
          <View style={styles.tabWithBadge}>
            <Text style={[styles.tabText, activeTab === 'orders' && styles.tabTextActive]}>
              My Orders
            </Text>
            {pendingOrdersCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{pendingOrdersCount}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {activeTab === 'list' && (
          <View style={styles.tabContent}>
            <ProductListingForm 
              onSuccess={() => {
                loadMyProducts();
                setEditingProduct(null);
                setActiveTab('products');
              }} 
              product={editingProduct}
            />
          </View>
        )}

        {activeTab === 'products' && (
          <View style={styles.tabContent}>
            {loading ? (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#16A34A" />
                <Text style={styles.loadingText}>Loading your products...</Text>
              </View>
            ) : myProducts.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>You haven't listed any products yet.</Text>
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={() => setActiveTab('list')}
                >
                  <Text style={styles.emptyButtonText}>List Your First Product</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.productsGrid}>
                {myProducts.map((product) => (
                  <View key={product._id} style={styles.productCard}>
                    <TouchableOpacity
                      onPress={() => router.push(`/product/${product._id}`)}
                    >
                      <ExpoImage
                        source={product.images?.[0] ? { uri: product.images[0] } : require('@/assets/images/icon.png')}
                        style={styles.productImage}
                        contentFit="cover"
                        placeholder={require('@/assets/images/icon.png')}
                      />
                      <View style={styles.productInfo}>
                        <Text style={styles.productName} numberOfLines={2}>
                          {product.name}
                        </Text>
                        <Text style={styles.productPrice}>
                          ETB {product.price?.toLocaleString()}
                        </Text>
                        <View style={styles.productMeta}>
                          <Text style={styles.productStock}>Stock: {product.stock || 0}</Text>
                          <View
                            style={[
                              styles.statusBadge,
                              product.isActive ? styles.statusActive : styles.statusInactive,
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusText,
                                product.isActive ? styles.statusTextActive : styles.statusTextInactive,
                              ]}
                            >
                              {product.isActive ? 'Active' : 'Inactive'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                    <View style={styles.productActions}>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => {
                          setEditingProduct(product);
                          setActiveTab('list');
                        }}
                      >
                        <Text style={styles.editButtonText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={async () => {
                          Alert.alert(
                            'Delete Product',
                            'Are you sure you want to delete this product?',
                            [
                              { text: 'Cancel', style: 'cancel' },
                              {
                                text: 'Delete',
                                style: 'destructive',
                                onPress: async () => {
                                  try {
                                    await productsAPI.delete(product._id);
                                    await loadMyProducts();
                                  } catch (error: any) {
                                    Alert.alert('Error', error.message || 'Failed to delete product');
                                  }
                                },
                              },
                            ]
                          );
                        }}
                      >
                        <Text style={styles.deleteButtonText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {activeTab === 'orders' && (
          <View style={styles.tabContent}>
            {/* Filters */}
            <View style={styles.filtersContainer}>
              <View style={styles.filterRow}>
                <Text style={styles.filterLabel}>Order Status:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                  {['', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.filterChip,
                        orderStatusFilter === status && styles.filterChipActive,
                      ]}
                      onPress={() => setOrderStatusFilter(status)}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          orderStatusFilter === status && styles.filterChipTextActive,
                        ]}
                      >
                        {status || 'All'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <View style={styles.filterRow}>
                <Text style={styles.filterLabel}>Payment Status:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                  {['', 'pending', 'paid', 'failed'].map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.filterChip,
                        paymentStatusFilter === status && styles.filterChipActive,
                      ]}
                      onPress={() => setPaymentStatusFilter(status)}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          paymentStatusFilter === status && styles.filterChipTextActive,
                        ]}
                      >
                        {status || 'All'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            {/* Orders List */}
            {loading ? (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#16A34A" />
                <Text style={styles.loadingText}>Loading orders...</Text>
              </View>
            ) : orders.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No orders found for your products.</Text>
              </View>
            ) : (
              <View style={styles.ordersList}>
                {orders.map((order) => {
                  const userId = (user as any)?._id?.toString() || user?.id?.toString();
                  const sellerItems = order.items.filter((item: any) => {
                    const sellerId = item.product?.seller?._id?.toString() || item.product?.seller?.id?.toString() || item.product?.seller?.toString();
                    return sellerId === userId;
                  });

                  const subtotal = sellerItems.reduce(
                    (sum: number, item: any) => sum + item.price * item.quantity,
                    0
                  );

                  return (
                    <View key={order._id} style={styles.orderCard}>
                      <View style={styles.orderHeader}>
                        <View>
                          <Text style={styles.orderId}>
                            Order #{order._id.substring(0, 8)}
                          </Text>
                          <Text style={styles.orderDate}>
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleString()
                              : 'N/A'}
                          </Text>
                        </View>
                        <View style={styles.statusContainer}>
                          <View
                            style={[
                              styles.statusBadge,
                              order.orderStatus === 'delivered'
                                ? styles.statusDelivered
                                : order.orderStatus === 'cancelled'
                                ? styles.statusCancelled
                                : order.orderStatus === 'shipped'
                                ? styles.statusShipped
                                : order.orderStatus === 'processing'
                                ? styles.statusProcessing
                                : styles.statusPending,
                            ]}
                          >
                            <Text style={styles.statusText}>{order.orderStatus}</Text>
                          </View>
                          <View
                            style={[
                              styles.statusBadge,
                              order.paymentStatus === 'paid'
                                ? styles.statusPaid
                                : order.paymentStatus === 'failed'
                                ? styles.statusFailed
                                : styles.statusPending,
                            ]}
                          >
                            <Text style={styles.statusText}>{order.paymentStatus}</Text>
                          </View>
                        </View>
                      </View>

                      <View style={styles.orderInfo}>
                        <Text style={styles.orderInfoText}>
                          <Text style={styles.orderInfoLabel}>Customer:</Text> {order.user?.name || 'N/A'}
                        </Text>
                        <Text style={styles.orderInfoText}>
                          <Text style={styles.orderInfoLabel}>Email:</Text> {order.user?.email || 'N/A'}
                        </Text>
                        <Text style={styles.orderInfoText}>
                          <Text style={styles.orderInfoLabel}>Phone:</Text> {order.shippingAddress?.phone || 'N/A'}
                        </Text>
                      </View>

                      <View style={styles.orderItems}>
                        <Text style={styles.orderItemsTitle}>Your Products in This Order:</Text>
                        <View style={styles.orderItemsList}>
                          {sellerItems.map((item: any, idx: number) => (
                            <Text key={idx} style={styles.orderItemText}>
                              {item.product?.name || 'Product'} x{item.quantity} - ETB{' '}
                              {item.price.toLocaleString()} each
                            </Text>
                          ))}
                          <View style={styles.orderSubtotal}>
                            <Text style={styles.orderSubtotalText}>
                              Subtotal: ETB {subtotal.toLocaleString()}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View style={styles.orderShipping}>
                        <Text style={styles.orderShippingTitle}>Shipping Address:</Text>
                        <Text style={styles.orderShippingText}>
                          {order.shippingAddress?.street}
                          {'\n'}
                          {order.shippingAddress?.city}, {order.shippingAddress?.state}
                          {'\n'}
                          {order.shippingAddress?.zipCode}, {order.shippingAddress?.country}
                        </Text>
                      </View>

                      <View style={styles.orderActions}>
                        {order.orderStatus === 'pending' && (
                          <>
                            <TouchableOpacity
                              style={[styles.actionButton, styles.actionButtonConfirm]}
                              onPress={() => handleConfirmOrder(order._id)}
                              disabled={updatingOrderId === order._id}
                            >
                              {updatingOrderId === order._id ? (
                                <ActivityIndicator color="#FFFFFF" />
                              ) : (
                                <Text style={styles.actionButtonText}>Confirm Order</Text>
                              )}
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.actionButton, styles.actionButtonReject]}
                              onPress={() => handleRejectOrder(order._id)}
                              disabled={updatingOrderId === order._id}
                            >
                              <Text style={styles.actionButtonText}>Reject Order</Text>
                            </TouchableOpacity>
                          </>
                        )}
                        {order.orderStatus === 'processing' && (
                          <TouchableOpacity
                            style={[styles.actionButton, styles.actionButtonShipped]}
                            onPress={() => handleUpdateOrderStatus(order._id, 'shipped')}
                            disabled={updatingOrderId === order._id}
                          >
                            {updatingOrderId === order._id ? (
                              <ActivityIndicator color="#FFFFFF" />
                            ) : (
                              <Text style={styles.actionButtonText}>Mark as Shipped</Text>
                            )}
                          </TouchableOpacity>
                        )}
                        {order.orderStatus === 'shipped' && (
                          <TouchableOpacity
                            style={[styles.actionButton, styles.actionButtonConfirm]}
                            onPress={() => handleUpdateOrderStatus(order._id, 'delivered')}
                            disabled={updatingOrderId === order._id}
                          >
                            {updatingOrderId === order._id ? (
                              <ActivityIndicator color="#FFFFFF" />
                            ) : (
                              <Text style={styles.actionButtonText}>Mark as Delivered</Text>
                            )}
                          </TouchableOpacity>
                        )}
                        {order.trackingNumber && (
                          <Text style={styles.trackingText}>
                            Tracking: {order.trackingNumber}
                          </Text>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#16A34A',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#16A34A',
    fontWeight: '600',
  },
  tabWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  centerContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  productCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#F3F4F6',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
    minHeight: 40,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#16A34A',
    marginBottom: 8,
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productStock: {
    fontSize: 12,
    color: '#6B7280',
  },
  productActions: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    paddingTop: 0,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#16A34A',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#D1FAE5',
  },
  statusInactive: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextActive: {
    color: '#065F46',
  },
  statusTextInactive: {
    color: '#991B1B',
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusProcessing: {
    backgroundColor: '#DBEAFE',
  },
  statusShipped: {
    backgroundColor: '#E0E7FF',
  },
  statusDelivered: {
    backgroundColor: '#D1FAE5',
  },
  statusCancelled: {
    backgroundColor: '#FEE2E2',
  },
  statusPaid: {
    backgroundColor: '#D1FAE5',
  },
  statusFailed: {
    backgroundColor: '#FEE2E2',
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  filterRow: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#16A34A',
  },
  filterChipText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  ordersList: {
    gap: 16,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  orderId: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusContainer: {
    gap: 8,
    alignItems: 'flex-end',
  },
  orderInfo: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  orderInfoText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  orderInfoLabel: {
    fontWeight: '600',
    color: '#111827',
  },
  orderItems: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  orderItemsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  orderItemsList: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  orderItemText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  orderSubtotal: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  orderSubtotalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#16A34A',
  },
  orderShipping: {
    marginBottom: 16,
  },
  orderShippingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  orderShippingText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  orderActions: {
    gap: 8,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonConfirm: {
    backgroundColor: '#16A34A',
  },
  actionButtonReject: {
    backgroundColor: '#EF4444',
  },
  actionButtonShipped: {
    backgroundColor: '#3B82F6',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  trackingText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
  },
});

export default ProviderDashboard;
