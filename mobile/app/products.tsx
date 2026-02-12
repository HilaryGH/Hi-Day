import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image as ExpoImage } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { productsAPI } from '@/utils/api';
import Navbar from '@/components/Navbar';

const categories = [
  'Fashion & Apparel',
  'Electronics',
  'Home & Living',
  'Beauty & Personal Care',
  'Sports & Outdoors',
  'Books',
  'Toys & Games',
  'Food & Beverages',
  'Other',
];

const sortOptions = [
  { value: 'createdAt-desc', label: 'Newest First' },
  { value: 'createdAt-asc', label: 'Oldest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating.average-desc', label: 'Highest Rated' },
];

export default function ProductsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    search?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sortBy?: string;
    order?: string;
  }>();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    category: params.category || '',
    search: params.search || '',
    minPrice: params.minPrice || '',
    maxPrice: params.maxPrice || '',
    sortBy: params.sortBy || 'createdAt',
    order: params.order || 'desc',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20, // Limit to 20 products per page
    total: 0,
    pages: 0,
  });
  const [showFilters, setShowFilters] = useState(false);

  // Update filters when URL params change
  useEffect(() => {
    const newFilters = {
      category: params.category || '',
      search: params.search || '',
      minPrice: params.minPrice || '',
      maxPrice: params.maxPrice || '',
      sortBy: params.sortBy || 'createdAt',
      order: params.order || 'desc',
    };
    const filtersChanged = 
      newFilters.category !== filters.category ||
      newFilters.search !== filters.search ||
      newFilters.minPrice !== filters.minPrice ||
      newFilters.maxPrice !== filters.maxPrice ||
      newFilters.sortBy !== filters.sortBy ||
      newFilters.order !== filters.order;
    
    if (filtersChanged) {
      setFilters(newFilters);
      // Reset pagination when URL params change
      setPagination((prev) => ({ ...prev, page: 1 }));
    }
  }, [params.category, params.search, params.minPrice, params.maxPrice, params.sortBy, params.order]);

  const loadProductsWithFilters = async (filterParams?: typeof filters, pageNum?: number) => {
    const activeFilters = filterParams || filters;
    const currentPage = pageNum !== undefined ? pageNum : 1; // Always start from page 1 when filtering
    
    try {
      setLoading(true);
      const apiParams: any = {
        page: currentPage,
        limit: 20, // Fixed limit of 20 products per page
      };

      // Category filter - must be exact match
      if (activeFilters.category && activeFilters.category.trim()) {
        apiParams.category = activeFilters.category.trim();
      }
      
      // Search filter - searches by product name
      if (activeFilters.search && activeFilters.search.trim()) {
        apiParams.search = activeFilters.search.trim();
      }
      
      // Price filters
      if (activeFilters.minPrice) apiParams.minPrice = Number(activeFilters.minPrice);
      if (activeFilters.maxPrice) apiParams.maxPrice = Number(activeFilters.maxPrice);
      
      // Sort options
      if (activeFilters.sortBy) apiParams.sortBy = activeFilters.sortBy;
      if (activeFilters.order) apiParams.order = activeFilters.order;

      console.log('[Products] Loading with params:', apiParams);
      const data = await productsAPI.getAll(apiParams);
      console.log('[Products] Received data:', {
        productsCount: data.products?.length || 0,
        total: data.pagination?.total || 0,
        page: data.pagination?.page || 1,
        category: apiParams.category || 'all',
      });
      
      // Only set products if we got valid data
      if (data && data.products) {
        setProducts(data.products);
        setPagination({
          page: data.pagination?.page || currentPage,
          limit: 20,
          total: data.pagination?.total || 0,
          pages: data.pagination?.pages || 0,
        });
      } else {
        setProducts([]);
        setPagination({ page: 1, limit: 20, total: 0, pages: 0 });
      }
    } catch (error: any) {
      console.error('Error loading products:', error);
      Alert.alert('Error', error.message || 'Failed to load products');
      setProducts([]);
      setPagination({ page: 1, limit: 20, total: 0, pages: 0 });
    } finally {
      setLoading(false);
    }
  };

  // Load products when filters change
  useEffect(() => {
    // Load products whenever filters change
    setPagination((prev) => ({ ...prev, page: 1 }));
    loadProductsWithFilters(undefined, 1);
  }, [filters.category, filters.search, filters.minPrice, filters.maxPrice, filters.sortBy, filters.order]);

  const loadProducts = async () => {
    await loadProductsWithFilters();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    // Reset to page 1 when any filter changes
    setPagination((prev) => ({ ...prev, page: 1 }));

    // Update URL parameters
    const queryParams: any = {};
    if (newFilters.category) queryParams.category = newFilters.category;
    if (newFilters.search) queryParams.search = newFilters.search;
    if (newFilters.minPrice) queryParams.minPrice = newFilters.minPrice;
    if (newFilters.maxPrice) queryParams.maxPrice = newFilters.maxPrice;
    if (newFilters.sortBy !== 'createdAt') queryParams.sortBy = newFilters.sortBy;
    if (newFilters.order !== 'desc') queryParams.order = newFilters.order;

    router.setParams(queryParams);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      search: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'createdAt',
      order: 'desc',
    });
    router.setParams({});
  };

  const handleSortChange = (value: string) => {
    const [sortBy, order] = value.split('-');
    handleFilterChange('sortBy', sortBy);
    handleFilterChange('order', order);
  };

  const hasActiveFilters =
    filters.category || filters.search || filters.minPrice || filters.maxPrice;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Navbar />
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Shop Products</Text>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <Text style={styles.filterButtonText}>🔍 Filters</Text>
            {hasActiveFilters && <View style={styles.filterBadge} />}
          </TouchableOpacity>
        </View>

        {/* Active Filters */}
        {hasActiveFilters && (
          <View style={styles.activeFiltersContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {filters.category && (
                <View style={styles.activeFilterChip}>
                  <Text style={styles.activeFilterText}>Category: {filters.category}</Text>
                  <TouchableOpacity
                    onPress={() => handleFilterChange('category', '')}
                    style={styles.removeFilterButton}
                  >
                    <Text style={styles.removeFilterText}>×</Text>
                  </TouchableOpacity>
                </View>
              )}
              {filters.search && (
                <View style={styles.activeFilterChip}>
                  <Text style={styles.activeFilterText}>Search: {filters.search}</Text>
                  <TouchableOpacity
                    onPress={() => handleFilterChange('search', '')}
                    style={styles.removeFilterButton}
                  >
                    <Text style={styles.removeFilterText}>×</Text>
                  </TouchableOpacity>
                </View>
              )}
              {(filters.minPrice || filters.maxPrice) && (
                <View style={styles.activeFilterChip}>
                  <Text style={styles.activeFilterText}>
                    Price: {filters.minPrice || '0'} - {filters.maxPrice || '∞'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      handleFilterChange('minPrice', '');
                      handleFilterChange('maxPrice', '');
                    }}
                    style={styles.removeFilterButton}
                  >
                    <Text style={styles.removeFilterText}>×</Text>
                  </TouchableOpacity>
                </View>
              )}
              <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
                <Text style={styles.clearFiltersText}>Clear All</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search products by name..."
            value={filters.search}
            onChangeText={(text) => {
              setFilters({ ...filters, search: text });
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            onSubmitEditing={() => {
              handleFilterChange('search', filters.search);
            }}
            returnKeyType="search"
          />
          {filters.search && (
            <TouchableOpacity
              style={styles.searchButton}
              onPress={() => {
                handleFilterChange('search', filters.search);
              }}
            >
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Category Chips */}
        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.categoryChip,
                !filters.category && styles.categoryChipActive,
              ]}
              onPress={() => handleFilterChange('category', '')}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  !filters.category && styles.categoryChipTextActive,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  filters.category === category && styles.categoryChipActive,
                ]}
                onPress={() => handleFilterChange('category', category)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    filters.category === category && styles.categoryChipTextActive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Sort */}
        <View style={styles.sortContainer}>
          <Text style={styles.sortLabel}>Sort by:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {sortOptions.map((option) => {
              const isActive =
                `${filters.sortBy}-${filters.order}` === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.sortChip,
                    isActive && styles.sortChipActive,
                  ]}
                  onPress={() => handleSortChange(option.value)}
                >
                  <Text
                    style={[
                      styles.sortChipText,
                      isActive && styles.sortChipTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Products Grid */}
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#16A34A" />
            <Text style={styles.loadingText}>Loading products...</Text>
          </View>
        ) : products.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>No products found</Text>
            {filters.category ? (
              <Text style={styles.emptyText}>
                No products available in the "{filters.category}" category.
              </Text>
            ) : filters.search ? (
              <Text style={styles.emptyText}>
                No products match your search "{filters.search}".
              </Text>
            ) : (
              <Text style={styles.emptyText}>
                Try adjusting your filters or search criteria.
              </Text>
            )}
            {hasActiveFilters && (
              <TouchableOpacity style={styles.emptyButton} onPress={clearFilters}>
                <Text style={styles.emptyButtonText}>Clear Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <>
            <View style={styles.resultsInfo}>
              <Text style={styles.resultsText}>
                {pagination.total} {pagination.total === 1 ? 'product' : 'products'} found
              </Text>
            </View>
            <View style={styles.productsGrid}>
              {products.map((product) => (
                <View key={product._id} style={styles.productCard}>
                  <TouchableOpacity
                    onPress={() => router.push(`/product/${product._id}` as any)}
                    activeOpacity={0.7}
                  >
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
                      {product.seller?.name && (
                        <Text style={styles.productSeller} numberOfLines={1}>
                          by {product.seller.name}
                        </Text>
                      )}
                      <View style={styles.productPriceRow}>
                        <Text style={styles.productPrice}>
                          ETB {product.price?.toLocaleString()}
                        </Text>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <Text style={styles.productOriginalPrice}>
                            ETB {product.originalPrice.toLocaleString()}
                          </Text>
                        )}
                      </View>
                      {product.isBestSeller && (
                        <View style={styles.bestSellerBadge}>
                          <Text style={styles.bestSellerText}>⭐ Best Seller</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.buyNowButton}
                    onPress={() => {
                      router.push({
                        pathname: '/checkout',
                        params: {
                          product: JSON.stringify({
                            _id: product._id,
                            id: product._id,
                            name: product.name,
                            price: product.price,
                            images: product.images,
                            quantity: 1,
                          }),
                          fromCart: 'false',
                        },
                      });
                    }}
                  >
                    <Text style={styles.buyNowButtonText}>Buy Now</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* Filters Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity
                onPress={() => setShowFilters(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              {/* Price Range */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Price Range</Text>
                <View style={styles.priceInputRow}>
                  <View style={styles.priceInputContainer}>
                    <Text style={styles.priceInputLabel}>Min (ETB)</Text>
                    <TextInput
                      style={styles.priceInput}
                      placeholder="0"
                      value={filters.minPrice}
                      onChangeText={(text) => handleFilterChange('minPrice', text)}
                      keyboardType="number-pad"
                    />
                  </View>
                  <View style={styles.priceInputContainer}>
                    <Text style={styles.priceInputLabel}>Max (ETB)</Text>
                    <TextInput
                      style={styles.priceInput}
                      placeholder="∞"
                      value={filters.maxPrice}
                      onChangeText={(text) => handleFilterChange('maxPrice', text)}
                      keyboardType="number-pad"
                    />
                  </View>
                </View>
              </View>

              {/* Category */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Category</Text>
                <View style={styles.modalCategoryList}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.modalCategoryItem,
                        filters.category === category && styles.modalCategoryItemActive,
                      ]}
                      onPress={() => {
                        handleFilterChange('category', category);
                        setShowFilters(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.modalCategoryText,
                          filters.category === category && styles.modalCategoryTextActive,
                        ]}
                      >
                        {category}
                      </Text>
                      {filters.category === category && (
                        <Text style={styles.modalCategoryCheck}>✓</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={clearFilters}
              >
                <Text style={styles.modalButtonTextSecondary}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={() => setShowFilters(false)}
              >
                <Text style={styles.modalButtonTextPrimary}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    position: 'relative',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  filterBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  activeFiltersContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  activeFilterText: {
    fontSize: 12,
    color: '#0369A1',
    marginRight: 6,
  },
  removeFilterButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#0369A1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeFilterText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  clearFiltersButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    marginLeft: 8,
  },
  clearFiltersText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 8,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    alignItems: 'center',
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  categoriesContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#16A34A',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sortLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginRight: 12,
  },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  sortChipActive: {
    backgroundColor: '#16A34A',
  },
  sortChipText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  sortChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  centerContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
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
  resultsInfo: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  resultsText: {
    fontSize: 14,
    color: '#6B7280',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    gap: 8,
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
    height: 180,
    backgroundColor: '#F3F4F6',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
    minHeight: 40,
  },
  productSeller: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  productPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#16A34A',
  },
  productOriginalPrice: {
    fontSize: 14,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  bestSellerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bestSellerText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#92400E',
  },
  buyNowButton: {
    backgroundColor: '#16A34A',
    paddingVertical: 10,
    paddingHorizontal: 16,
    margin: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buyNowButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#374151',
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 16,
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  priceInputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  priceInputContainer: {
    flex: 1,
  },
  priceInputLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 6,
  },
  priceInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  modalCategoryList: {
    gap: 8,
  },
  modalCategoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalCategoryItemActive: {
    backgroundColor: '#D1FAE5',
    borderColor: '#16A34A',
  },
  modalCategoryText: {
    fontSize: 14,
    color: '#374151',
  },
  modalCategoryTextActive: {
    color: '#065F46',
    fontWeight: '600',
  },
  modalCategoryCheck: {
    fontSize: 16,
    color: '#16A34A',
    fontWeight: 'bold',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonSecondary: {
    backgroundColor: '#F3F4F6',
  },
  modalButtonPrimary: {
    backgroundColor: '#16A34A',
  },
  modalButtonTextSecondary: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonTextPrimary: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
