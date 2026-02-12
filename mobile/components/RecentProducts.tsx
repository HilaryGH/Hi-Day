import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image as ExpoImage } from 'expo-image';
import { productsAPI } from '@/utils/api';
import SectionBackground from './SectionBackground';

const { width } = Dimensions.get('window');

const RecentProducts: React.FC = () => {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentProducts = async () => {
      try {
        setLoading(true);
        const response = await productsAPI.getAll({
          limit: 8,
          sortBy: 'createdAt',
          order: 'desc',
        });
        setProducts(response.products || []);
      } catch (error) {
        console.error('Error fetching recent products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentProducts();
  }, []);

  const formatPrice = (price: number) => {
    return `ETB ${price.toLocaleString()}`;
  };

  const getDiscountPercentage = (product: any) => {
    if (product.onSale && product.originalPrice && product.price < product.originalPrice) {
      const discount = ((product.originalPrice - product.price) / product.originalPrice) * 100;
      return Math.round(discount);
    }
    return null;
  };

  return (
    <View style={[styles.container, { position: 'relative' }]}>
      {/* Background Images */}
      <SectionBackground opacity={0.15} imagesPerRow={3} />
      <View style={[styles.header, { zIndex: 10 }]}>
        {!loading && products.length > 0 && (
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => router.push('/products?sortBy=createdAt&order=desc')}
          >
            <Text style={styles.viewAllButtonText}>View All</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={[styles.loadingContainer, { zIndex: 10 }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productsContainer}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <View key={item} style={styles.productCardSkeleton}>
                <ActivityIndicator size="small" color="#16A34A" />
              </View>
            ))}
          </ScrollView>
        </View>
      ) : products.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.productsContainer, { zIndex: 10 }]}
        >
          {products.map((product) => {
            const discount = getDiscountPercentage(product);
            return (
              <TouchableOpacity
                key={product._id}
                style={styles.productCard}
                onPress={() => router.push(`/products/${product._id}`)}
                activeOpacity={0.7}
              >
                <View style={styles.imageContainer}>
                  {product.images && product.images.length > 0 ? (
                    <ExpoImage
                      source={{ uri: product.images[0] }}
                      style={styles.productImage}
                      contentFit="cover"
                      placeholder={require('@/assets/images/icon.png')}
                      transition={200}
                      onError={(error) => {
                        console.error('Error loading product image:', product.images[0], error);
                      }}
                    />
                  ) : (
                    <View style={styles.placeholderImage} />
                  )}

                  <View style={styles.newBadge}>
                    <Text style={styles.newBadgeText}>🆕 New</Text>
                  </View>

                  {discount && (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>-{discount}%</Text>
                    </View>
                  )}
                </View>

                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {product.name}
                  </Text>

                  {product.category && (
                    <Text style={styles.productCategory}>{product.category}</Text>
                  )}

                  {product.rating && product.rating.average > 0 && (
                    <View style={styles.ratingContainer}>
                      <View style={styles.stars}>
                        {[...Array(5)].map((_, i) => (
                          <Text key={i} style={styles.star}>
                            {i < Math.round(product.rating.average) ? '⭐' : '☆'}
                          </Text>
                        ))}
                      </View>
                      <Text style={styles.ratingCount}>({product.rating.count || 0})</Text>
                    </View>
                  )}

                  <View style={styles.priceContainer}>
                    <Text style={styles.price}>{formatPrice(product.price)}</Text>
                    {product.onSale && product.originalPrice && product.price < product.originalPrice && (
                      <Text style={styles.originalPrice}>{formatPrice(product.originalPrice)}</Text>
                    )}
                  </View>

                  {product.stock > 0 ? (
                    <View style={styles.stockContainer}>
                      <Text style={styles.stockText}>✓ In Stock</Text>
                    </View>
                  ) : (
                    <View style={styles.stockContainer}>
                      <Text style={styles.outOfStockText}>✗ Out of Stock</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No recent products available at the moment.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 32,
    backgroundColor: 'rgba(249, 250, 251, 0.85)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  viewAllButton: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  viewAllButtonText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '600',
  },
  loadingContainer: {
    paddingHorizontal: 16,
  },
  productsContainer: {
    paddingHorizontal: 16,
    paddingRight: 16,
    flexDirection: 'row',
  },
  productCard: {
    width: width * 0.75,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginRight: 16,
  },
  productCardSkeleton: {
    width: width * 0.75,
    height: 400,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F9FAFB',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E7EB',
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  productInfo: {
    padding: 16,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  productCategory: {
    fontSize: 10,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },
  stars: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 10,
  },
  ratingCount: {
    fontSize: 10,
    color: '#6B7280',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#16A34A',
  },
  originalPrice: {
    fontSize: 12,
    color: '#6B7280',
    textDecorationLine: 'line-through',
  },
  stockContainer: {
    marginTop: 4,
  },
  stockText: {
    fontSize: 11,
    color: '#16A34A',
    fontWeight: '500',
  },
  outOfStockText: {
    fontSize: 11,
    color: '#EF4444',
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default RecentProducts;
