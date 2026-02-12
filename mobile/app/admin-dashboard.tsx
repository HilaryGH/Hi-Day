import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image as ExpoImage } from 'expo-image';
import { useAuth } from '@/context/AuthContext';
import { adminAPI, productsAPI } from '@/utils/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TabType = 'stats' | 'users' | 'providers' | 'products' | 'create-product' | 'promotions' | 'orders';

const AdminDashboard = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('stats');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [orderStats, setOrderStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    } else if (user && user.role !== 'admin' && user.role !== 'super admin') {
      router.replace('/(tabs)');
    }
  }, [user, authLoading]);

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
  }, [user, activeTab, orderStatusFilter, paymentStatusFilter]);

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
        page: 1,
        limit: 20,
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
      const response = await adminAPI.getAllUsers({
        search: searchTerm.trim() || undefined,
        page: 1,
        limit: 50,
      });
      const providers = (response.users || []).filter(
        (u: any) =>
          u.role === 'product provider' ||
          u.role === 'service provider' ||
          u.role === 'seller'
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
        page: 1,
        limit: 20,
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
        page: 1,
        limit: 50,
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

  const handleRefresh = async () => {
    setRefreshing(true);
    if (activeTab === 'stats') {
      await loadStats();
    } else if (activeTab === 'users') {
      await loadUsers();
    } else if (activeTab === 'providers') {
      await loadProviders();
    } else if (activeTab === 'products') {
      await loadProducts();
    } else if (activeTab === 'orders') {
      await loadOrders();
      await loadOrderStats();
    }
    setRefreshing(false);
  };

  const handleVerifyProvider = async (userId: string) => {
    Alert.alert('Verify Provider', 'Are you sure you want to verify this provider?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Verify',
        onPress: async () => {
          setError('');
          try {
            await adminAPI.verifyProvider(userId);
            if (activeTab === 'providers') {
              await loadProviders();
            }
            if (activeTab === 'stats') {
              await loadStats();
            }
          } catch (err: any) {
            setError(err.message || 'Failed to verify provider');
          }
        },
      },
    ]);
  };

  const handleDeleteUser = async (userId: string) => {
    Alert.alert(
      'Delete User',
      'Are you sure you want to delete this user? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setError('');
            try {
              await adminAPI.deleteUser(userId);
              if (activeTab === 'users') {
                await loadUsers();
              } else if (activeTab === 'providers') {
                await loadProviders();
              }
              await loadStats();
            } catch (err: any) {
              setError(err.message || 'Failed to delete user');
            }
          },
        },
      ]
    );
  };

  const handleDeleteProduct = async (productId: string) => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setError('');
            try {
              await adminAPI.deleteProduct(productId);
              await loadProducts();
              await loadStats();
            } catch (err: any) {
              setError(err.message || 'Failed to delete product');
            }
          },
        },
      ]
    );
  };

  const handleToggleProductStatus = async (productId: string) => {
    setError('');
    try {
      await adminAPI.toggleProductStatus(productId);
      await loadProducts();
      await loadStats();
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#16A34A" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!user || (user.role !== 'admin' && user.role !== 'super admin')) {
    return null;
  }

  const tabs = [
    { id: 'stats', label: 'Statistics' },
    { id: 'users', label: 'Users' },
    { id: 'providers', label: 'Providers' },
    { id: 'products', label: 'Products' },
    { id: 'create-product', label: 'Create Product' },
    { id: 'orders', label: 'Orders' },
    { id: 'promotions', label: 'Promotions' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <Text style={styles.headerSubtitle}>
          Welcome, {user.name}! Manage users, products, and platform settings.
        </Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.tabActive]}
            onPress={() => {
              setActiveTab(tab.id as TabType);
              setSearchTerm('');
            }}
          >
            <Text
              style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tab Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {activeTab === 'stats' && (
          <View style={styles.tabContent}>
            {loading ? (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#16A34A" />
                <Text style={styles.loadingText}>Loading statistics...</Text>
              </View>
            ) : stats ? (
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Total Users</Text>
                  <Text style={styles.statValue}>{stats.totalUsers}</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Total Providers</Text>
                  <Text style={styles.statValue}>{stats.totalProviders}</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Verified Providers</Text>
                  <Text style={[styles.statValue, styles.statValueSuccess]}>
                    {stats.verifiedProviders}
                  </Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Pending Verification</Text>
                  <Text style={[styles.statValue, styles.statValueWarning]}>
                    {stats.pendingVerification}
                  </Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Total Products</Text>
                  <Text style={styles.statValue}>{stats.totalProducts}</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Active Products</Text>
                  <Text style={[styles.statValue, styles.statValueSuccess]}>
                    {stats.activeProducts}
                  </Text>
                </View>
                {stats.totalOrders !== undefined && (
                  <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Total Orders</Text>
                    <Text style={styles.statValue}>{stats.totalOrders}</Text>
                  </View>
                )}
                {stats.pendingOrders !== undefined && (
                  <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Pending Orders</Text>
                    <Text style={[styles.statValue, styles.statValueWarning]}>
                      {stats.pendingOrders}
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No statistics available</Text>
              </View>
            )}
          </View>
        )}

        {(activeTab === 'users' || activeTab === 'providers') && (
          <View style={styles.tabContent}>
            {/* Search */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder={
                  activeTab === 'users'
                    ? 'Search users by name or email...'
                    : 'Search providers by name or email...'
                }
                value={searchTerm}
                onChangeText={setSearchTerm}
                onSubmitEditing={() => {
                  if (activeTab === 'users') {
                    loadUsers();
                  } else {
                    loadProviders();
                  }
                }}
              />
              <TouchableOpacity
                style={styles.searchButton}
                onPress={() => {
                  if (activeTab === 'users') {
                    loadUsers();
                  } else {
                    loadProviders();
                  }
                }}
              >
                <Text style={styles.searchButtonText}>Search</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#16A34A" />
                <Text style={styles.loadingText}>Loading users...</Text>
              </View>
            ) : users.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No users found</Text>
              </View>
            ) : (
              <View style={styles.usersList}>
                {users.map((userItem) => (
                  <View key={userItem._id} style={styles.userCard}>
                    <View style={styles.userInfo}>
                      <Text style={styles.userName}>{userItem.name}</Text>
                      <Text style={styles.userEmail}>{userItem.email}</Text>
                      <Text style={styles.userRole}>{userItem.role}</Text>
                      <View
                        style={[
                          styles.statusBadge,
                          activeTab === 'providers'
                            ? userItem.isVerified
                              ? styles.statusVerified
                              : styles.statusPending
                            : userItem.isActive !== false
                            ? styles.statusActive
                            : styles.statusInactive,
                        ]}
                      >
                        <Text style={styles.statusText}>
                          {activeTab === 'providers'
                            ? userItem.isVerified
                              ? 'Verified'
                              : 'Pending'
                            : userItem.isActive !== false
                            ? 'Active'
                            : 'Inactive'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.userActions}>
                      {activeTab === 'providers' && !userItem.isVerified && (
                        <TouchableOpacity
                          style={[styles.actionButton, styles.actionButtonVerify]}
                          onPress={() => handleVerifyProvider(userItem._id)}
                        >
                          <Text style={styles.actionButtonText}>Verify</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={[styles.actionButton, styles.actionButtonDelete]}
                        onPress={() => handleDeleteUser(userItem._id)}
                      >
                        <Text style={styles.actionButtonText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {activeTab === 'products' && (
          <View style={styles.tabContent}>
            {/* Search */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search products by name or description..."
                value={searchTerm}
                onChangeText={setSearchTerm}
                onSubmitEditing={loadProducts}
              />
              <TouchableOpacity style={styles.searchButton} onPress={loadProducts}>
                <Text style={styles.searchButtonText}>Search</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#16A34A" />
                <Text style={styles.loadingText}>Loading products...</Text>
              </View>
            ) : products.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No products found</Text>
              </View>
            ) : (
              <View style={styles.productsGrid}>
                {products.map((product) => (
                  <View key={product._id} style={styles.productCard}>
                    <ExpoImage
                      source={
                        product.images?.[0]
                          ? { uri: product.images[0] }
                          : require('@/assets/images/icon.png')
                      }
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
                              product.isActive
                                ? styles.statusTextActive
                                : styles.statusTextInactive,
                            ]}
                          >
                            {product.isActive ? 'Active' : 'Inactive'}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.productSeller}>
                        Seller: {product.seller?.name || 'Unknown'}
                      </Text>
                      {product.isBestSeller && (
                        <View style={styles.bestSellerBadge}>
                          <Text style={styles.bestSellerText}>⭐ Best Seller</Text>
                        </View>
                      )}
                      <View style={styles.productActions}>
                        <TouchableOpacity
                          style={[
                            styles.productActionButton,
                            product.isActive
                              ? styles.productActionButtonDeactivate
                              : styles.productActionButtonActivate,
                          ]}
                          onPress={() => handleToggleProductStatus(product._id)}
                        >
                          <Text style={styles.productActionButtonText}>
                            {product.isActive ? 'Deactivate' : 'Activate'}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.productActionButton, styles.productActionButtonDelete]}
                          onPress={() => handleDeleteProduct(product._id)}
                        >
                          <Text style={styles.productActionButtonText}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                      <TouchableOpacity
                        style={[
                          styles.productActionButton,
                          styles.productActionButtonBestSeller,
                          product.isBestSeller && styles.productActionButtonBestSellerActive,
                        ]}
                        onPress={() => handleToggleBestSeller(product._id)}
                      >
                        <Text style={styles.productActionButtonText}>
                          {product.isBestSeller
                            ? 'Remove from Best Sellers'
                            : 'Mark as Best Seller'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {activeTab === 'create-product' && (
          <View style={styles.tabContent}>
            <View style={styles.infoContainer}>
              <Text style={styles.infoTitle}>Create Imported Product</Text>
              <Text style={styles.infoText}>
                As an admin, you can list imported products. Check the "Mark as Imported Product"
                checkbox when creating the product.
              </Text>
            </View>
            {/* ProductListingForm will be added here */}
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Product creation form coming soon</Text>
            </View>
          </View>
        )}

        {activeTab === 'orders' && (
          <View style={styles.tabContent}>
            {/* Order Statistics */}
            {orderStats && (
              <View style={styles.orderStatsGrid}>
                <View style={styles.orderStatCard}>
                  <Text style={styles.orderStatLabel}>Total Orders</Text>
                  <Text style={styles.orderStatValue}>
                    {orderStats.totalOrders || 0}
                  </Text>
                </View>
                <View style={styles.orderStatCard}>
                  <Text style={styles.orderStatLabel}>Total Revenue</Text>
                  <Text style={[styles.orderStatValue, styles.orderStatValueSuccess]}>
                    ETB {(orderStats.totalRevenue || 0).toLocaleString()}
                  </Text>
                </View>
                <View style={styles.orderStatCard}>
                  <Text style={styles.orderStatLabel}>Pending Payment</Text>
                  <Text style={[styles.orderStatValue, styles.orderStatValueWarning]}>
                    ETB {(orderStats.pendingPayment || 0).toLocaleString()}
                  </Text>
                </View>
                <View style={styles.orderStatCard}>
                  <Text style={styles.orderStatLabel}>Delivered Orders</Text>
                  <Text style={[styles.orderStatValue, styles.orderStatValueSuccess]}>
                    {orderStats.deliveredOrders || 0}
                  </Text>
                </View>
              </View>
            )}

            {/* Filters */}
            <View style={styles.filtersContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search by Order ID, Customer Name, or Email..."
                value={searchTerm}
                onChangeText={setSearchTerm}
                onSubmitEditing={loadOrders}
              />
              <View style={styles.filterRow}>
                <Text style={styles.filterLabel}>Order Status:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {['', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(
                    (status) => (
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
                    )
                  )}
                </ScrollView>
              </View>
              <View style={styles.filterRow}>
                <Text style={styles.filterLabel}>Payment Status:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {['', 'pending', 'paid', 'failed', 'refunded'].map((status) => (
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
              <TouchableOpacity style={styles.searchButton} onPress={loadOrders}>
                <Text style={styles.searchButtonText}>Search</Text>
              </TouchableOpacity>
            </View>

            {/* Orders List */}
            {loading ? (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#16A34A" />
                <Text style={styles.loadingText}>Loading orders...</Text>
              </View>
            ) : orders.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No orders found</Text>
              </View>
            ) : (
              <View style={styles.ordersList}>
                {orders.map((order) => (
                  <View key={order._id} style={styles.orderCard}>
                    <View style={styles.orderHeader}>
                      <View>
                        <Text style={styles.orderId}>
                          Order #{order._id.substring(0, 8)}
                        </Text>
                        <Text style={styles.orderDate}>
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString()
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
                          <Text style={styles.statusText}>
                            {order.orderStatus || 'pending'}
                          </Text>
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
                          <Text style={styles.statusText}>
                            {order.paymentStatus || 'pending'}
                          </Text>
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
                        <Text style={styles.orderInfoLabel}>Items:</Text> {order.items?.length || 0} item(s)
                      </Text>
                      <Text style={styles.orderInfoText}>
                        <Text style={styles.orderInfoLabel}>Total:</Text> ETB{' '}
                        {order.totalAmount?.toLocaleString() || '0'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.viewDetailsButton}
                      onPress={() => router.push(`/order/${order._id}`)}
                    >
                      <Text style={styles.viewDetailsText}>View Details →</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {activeTab === 'promotions' && (
          <View style={styles.tabContent}>
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Promotion Management</Text>
              <Text style={styles.emptySubtext}>
                Create and manage sales, discounts, and promotions
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.push('/promotions')}
              >
                <Text style={styles.emptyButtonText}>Go to Promotion Management</Text>
              </TouchableOpacity>
            </View>
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
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
    padding: 12,
    margin: 16,
    borderRadius: 8,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
  },
  tabsContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabsContent: {
    paddingHorizontal: 8,
  },
  tab: {
    paddingVertical: 16,
    paddingHorizontal: 16,
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
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  statValueSuccess: {
    color: '#16A34A',
  },
  statValueWarning: {
    color: '#F59E0B',
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#D1D5DB',
    color: '#1F2937',
    placeholderTextColor: '#6B7280',
  },
  searchButton: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  usersList: {
    gap: 12,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    marginBottom: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 12,
    color: '#9CA3AF',
    textTransform: 'capitalize',
    marginBottom: 8,
  },
  userActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonVerify: {
    backgroundColor: '#16A34A',
  },
  actionButtonDelete: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusActive: {
    backgroundColor: '#D1FAE5',
  },
  statusInactive: {
    backgroundColor: '#FEE2E2',
  },
  statusVerified: {
    backgroundColor: '#D1FAE5',
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusDelivered: {
    backgroundColor: '#D1FAE5',
  },
  statusCancelled: {
    backgroundColor: '#FEE2E2',
  },
  statusShipped: {
    backgroundColor: '#DBEAFE',
  },
  statusProcessing: {
    backgroundColor: '#FEF3C7',
  },
  statusPaid: {
    backgroundColor: '#D1FAE5',
  },
  statusFailed: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  statusTextActive: {
    color: '#065F46',
  },
  statusTextInactive: {
    color: '#991B1B',
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
    marginBottom: 8,
  },
  productStock: {
    fontSize: 12,
    color: '#6B7280',
  },
  productSeller: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  bestSellerBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  bestSellerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
  },
  productActions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  productActionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  productActionButtonActivate: {
    backgroundColor: '#D1FAE5',
  },
  productActionButtonDeactivate: {
    backgroundColor: '#FEF3C7',
  },
  productActionButtonDelete: {
    backgroundColor: '#FEE2E2',
  },
  productActionButtonBestSeller: {
    width: '100%',
    backgroundColor: '#F3F4F6',
    marginTop: 4,
  },
  productActionButtonBestSellerActive: {
    backgroundColor: '#E9D5FF',
  },
  productActionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  infoContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  orderStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  orderStatCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderStatLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 8,
  },
  orderStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  orderStatValueSuccess: {
    color: '#16A34A',
  },
  orderStatValueWarning: {
    color: '#F59E0B',
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  filterRow: {
    marginTop: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
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
    gap: 12,
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
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
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
    marginBottom: 12,
    paddingBottom: 12,
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
  viewDetailsButton: {
    marginTop: 8,
  },
  viewDetailsText: {
    color: '#16A34A',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AdminDashboard;
