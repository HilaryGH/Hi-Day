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

const { width } = Dimensions.get('window');

const BestSellers: React.FC = () => {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        setLoading(true);
        const response = await productsAPI.getBestSellers(4);
        setProducts(response.products || []);
      } catch (error) {
        console.error('Error fetching best sellers:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBestSellers();
  }, []);

  if (!loading && products.length === 0) {
    return null;
  }

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
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>⭐ Best Sellers</Text>
          </View>
          <Text style={styles.title}>Customer Favorites</Text>
          <Text style={styles.subtitle}>
            Discover our most popular products loved by thousands of customers
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <View style={styles.productsGrid}>
            {[1, 2, 3, 4].map((item) => (
              <View key={item} style={styles.productCardSkeleton}>
                <ActivityIndicator size="small" color="#16A34A" />
              </View>
            ))}
          </View>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productsContainer}
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

                  <View style={styles.bestSellerBadge}>
                    <Text style={styles.bestSellerText}>⭐ Best Seller</Text>
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
      )}

      {!loading && products.length > 0 && (
        <View style={styles.viewAllContainer}>
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => router.push('/products?sortBy=rating.average&order=desc')}
          >
            <Text style={styles.viewAllText}>View All Products</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 32,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  badge: {
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16A34A',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: width - 64,
  },
  loadingContainer: {
    paddingHorizontal: 16,
  },
  productsContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  productsGrid: {
    flexDirection: 'row',
    gap: 16,
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
  },
  productCardSkeleton: {
    width: width * 0.75,
    height: 400,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
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
  bestSellerBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#16A34A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  bestSellerText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  productInfo: {
    padding: 16,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  productCategory: {
    fontSize: 11,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  stars: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 12,
  },
  ratingCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#16A34A',
  },
  originalPrice: {
    fontSize: 14,
    color: '#6B7280',
    textDecorationLine: 'line-through',
  },
  stockContainer: {
    marginTop: 4,
  },
  stockText: {
    fontSize: 12,
    color: '#16A34A',
    fontWeight: '500',
  },
  outOfStockText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '500',
  },
  viewAllContainer: {
    paddingHorizontal: 16,
    marginTop: 24,
    alignItems: 'center',
  },
  viewAllButton: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  viewAllText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BestSellers;
