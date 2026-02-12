import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image as ExpoImage } from 'expo-image';
import { productsAPI, promotionAPI } from '@/utils/api';
import BestSellers from '@/components/BestSellers';
import TopSellers from '@/components/TopSellers';
import RecentProducts from '@/components/RecentProducts';
import Navbar from '@/components/Navbar';
import CommunicationWidget from '@/components/CommunicationWidget';
import SectionBackground from '@/components/SectionBackground';

const { width } = Dimensions.get('window');

const categories = [
  { name: 'Fashion & Apparel', categoryName: 'Fashion & Apparel' },
  { name: 'Electronics', categoryName: 'Electronics' },
  { name: 'Home & Living', categoryName: 'Home & Living' },
  { name: 'Beauty & Personal Care', categoryName: 'Beauty & Personal Care' },
  { name: 'Sports & Outdoors', categoryName: 'Sports & Outdoors' },
  { name: 'Books', categoryName: 'Books' },
  { name: 'Toys & Games', categoryName: 'Toys & Games' },
  { name: 'Food & Beverages', categoryName: 'Food & Beverages' },
];

interface CategoryProduct {
  category: string;
  categoryName: string;
  products: any[];
  total: number;
}

export default function HomeScreen() {
  const router = useRouter();
  const [categoryProducts, setCategoryProducts] = useState<CategoryProduct[]>([]);
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [promotion, setPromotion] = useState<any>(null);
  const [discountedProduct, setDiscountedProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);
  
  // Animation values for imported products section
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Test API connection on mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await productsAPI.getAll({ limit: 1 });
        setApiConnected(true);
        setConnectionError(null);
        console.log('[Connection Test] ✅ Successfully connected to API');
      } catch (error: any) {
        setApiConnected(false);
        if (error?.isNetworkError || error?.status === 0) {
          const apiUrl = error?.apiUrl || 'the server';
          setConnectionError(
            `Cannot connect to ${apiUrl}. ` +
            `Make sure:\n` +
            `• Server is running (cd server && npm start)\n` +
            `• Device is on same network\n` +
            `• Configure IP in app.json if needed`
          );
        } else if (error?.status === 500) {
          setConnectionError('Server error (500). Please check server logs.');
        } else {
          setConnectionError(`Connection error: ${error?.message || 'Unknown error'}`);
        }
        console.error('[Connection Test] ❌ Failed:', error);
      }
    };
    testConnection();
  }, []);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        setLoading(true);
        const productPromises = categories.map(async (category) => {
          try {
            const response = await productsAPI.getAll({
              category: category.categoryName,
              limit: 4,
              sortBy: 'createdAt',
              order: 'desc',
            });
            return {
              category: category.name,
              categoryName: category.categoryName,
              products: response.products || [],
              total: response.pagination?.total || 0,
            };
          } catch (error: any) {
            console.error(`Error fetching products for ${category.name}:`, error);
            // Log more details for 500 errors
            if (error?.status === 500) {
              console.error(`[500 Error] Category: ${category.name}`, error?.data || error?.message);
            }
            return {
              category: category.name,
              categoryName: category.categoryName,
              products: [],
              total: 0,
            };
          }
        });

        const results = await Promise.all(productPromises);
        setCategoryProducts(results);
      } catch (error: any) {
        console.error('Error fetching category products:', error);
        if (error?.status === 500) {
          console.error('[500 Error] Category products fetch failed:', error?.data || error?.message);
        }
        if (!apiConnected) {
          setConnectionError('Failed to load products. Please check your connection.');
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchNewArrivals = async () => {
      try {
        const response = await productsAPI.getAll({
          limit: 3,
          sortBy: 'createdAt',
          order: 'desc',
        });
        if (response.products && response.products.length > 0) {
          setNewArrivals(response.products);
        }
      } catch (error) {
        console.error('Error fetching new arrivals:', error);
      }
    };

    const fetchPromotion = async () => {
      try {
        const response = await promotionAPI.getAll({ active: true, limit: 1 });
        let promotions = [];
        if (response) {
          if (Array.isArray(response)) {
            promotions = response;
          } else if (response.promotions && Array.isArray(response.promotions)) {
            promotions = response.promotions;
          } else if (response.data && Array.isArray(response.data)) {
            promotions = response.data;
          }
        }

        if (promotions.length > 0) {
          const fetchedPromotion = promotions[0];
          setPromotion(fetchedPromotion);

          if (fetchedPromotion.products && fetchedPromotion.products.length > 0) {
            try {
              const productId = fetchedPromotion.products[0]._id || fetchedPromotion.products[0];
              const productResponse = await productsAPI.getOne(productId);
              if (productResponse) {
                setDiscountedProduct(productResponse);
                return;
              }
            } catch (error: any) {
              console.error('Error fetching discounted product from promotion:', error);
              if (error?.status === 500) {
                console.error('[500 Error] Promotion product fetch failed:', error?.data || error?.message);
              }
            }
          }

          try {
            const productsResponse = await productsAPI.getAll({ limit: 20 });
            if (productsResponse && productsResponse.products && productsResponse.products.length > 0) {
              const onSaleProduct = productsResponse.products.find(
                (p: any) => p.onSale === true || p.promotion || (p.originalPrice && p.price < p.originalPrice)
              );
              if (onSaleProduct) {
                setDiscountedProduct(onSaleProduct);
              }
            }
          } catch (error: any) {
            console.error('Error fetching discounted product:', error);
            if (error?.status === 500) {
              console.error('[500 Error] Discounted product fetch failed:', error?.data || error?.message);
            }
          }
        } else {
          try {
            const productsResponse = await productsAPI.getAll({ limit: 10 });
            if (productsResponse && productsResponse.products && productsResponse.products.length > 0) {
              const featuredProduct = productsResponse.products.find(
                (p: any) => p.onSale === true || p.featured || (p.originalPrice && p.price < p.originalPrice)
              ) || productsResponse.products[0];
              setDiscountedProduct(featuredProduct);
            }
          } catch (error: any) {
            console.error('Error fetching featured product:', error);
            if (error?.status === 500) {
              console.error('[500 Error] Featured product fetch failed:', error?.data || error?.message);
            }
          }
        }
      } catch (error: any) {
        if (error?.status !== 404) {
          console.error('Error fetching promotion:', error);
          if (error?.status === 500) {
            console.error('[500 Error] Promotion fetch failed:', error?.data || error?.message);
          }
        }
        try {
          const fallbackResponse = await productsAPI.getAll({ limit: 1 });
          if (fallbackResponse && fallbackResponse.products && fallbackResponse.products.length > 0) {
            setDiscountedProduct(fallbackResponse.products[0]);
          }
        } catch (fallbackError: any) {
          console.error('Error fetching fallback product:', fallbackError);
          if (fallbackError?.status === 500) {
            console.error('[500 Error] Fallback product fetch failed:', fallbackError?.data || fallbackError?.message);
          }
        }
      }
    };

    fetchCategoryProducts();
    fetchNewArrivals();
    fetchPromotion();
  }, []);

  // Animate imported products section on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Auto-slide carousel for New Arrivals
  useEffect(() => {
    if (newArrivals.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % newArrivals.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [newArrivals.length]);

  const formatPrice = (price: number) => {
    return `ETB ${price.toLocaleString()}`;
  };

  const getDiscountPercentage = () => {
    if (promotion?.discountValue) {
      return promotion.discountType === 'percentage'
        ? `${promotion.discountValue}% OFF`
        : `Save ${promotion.discountValue} ETB`;
    }
    if (discountedProduct?.originalPrice && discountedProduct?.price) {
      const discount = Math.round(
        ((discountedProduct.originalPrice - discountedProduct.price) / discountedProduct.originalPrice) * 100
      );
      return `${discount}% OFF`;
    }
    return 'Special Offer';
  };

  return (
    <View style={styles.container}>
      <Navbar />
      {connectionError && (
        <View style={styles.errorBanner}>
          <View style={styles.errorContent}>
            <Text style={styles.errorText}>⚠️ {connectionError}</Text>
            <Text style={styles.errorSubtext}>
              Check console for API URL being used
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              setConnectionError(null);
              setApiConnected(null);
              // Retry connection
              productsAPI.getAll({ limit: 1 })
                .then(() => {
                  setApiConnected(true);
                  setConnectionError(null);
                })
                .catch((err: any) => {
                  setApiConnected(false);
                  if (err?.isNetworkError || err?.status === 0) {
                    const apiUrl = err?.apiUrl || 'the server';
                    setConnectionError(
                      `Cannot connect to ${apiUrl}. Check server is running and IP is correct.`
                    );
                  } else {
                    setConnectionError('Connection failed. Please check server.');
                  }
                });
            }}
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        {/* Background Images */}
        <SectionBackground opacity={0.15} imagesPerRow={3} />
        {/* Promotional Banner */}
        <TouchableOpacity
          style={[styles.promoBanner, { zIndex: 10 }]}
          onPress={() => router.push('/products')}
          activeOpacity={0.9}
        >
          {(discountedProduct?.images?.[0] || promotion?.image) ? (
            <ExpoImage
              source={{ uri: discountedProduct?.images?.[0] || promotion?.image }}
              style={styles.promoImage}
              contentFit="cover"
              placeholder={require('@/assets/images/icon.png')}
              transition={200}
              onError={(error) => {
                console.error('Error loading promo image:', error);
              }}
            />
          ) : (
            <View style={styles.promoGradient} />
          )}
          <View style={styles.promoOverlay} />
          <View style={styles.promoContent}>
            <View style={styles.promoBadge}>
              <Text style={styles.promoBadgeText}>
                {promotion?.bannerText || promotion?.title || discountedProduct?.name ? 'SALE' : 'SALE'}
              </Text>
              <Text style={styles.promoBadgeSubtext}>Limited Time</Text>
            </View>
            <Text style={styles.promoTitle}>
              {promotion?.name || promotion?.title || discountedProduct?.name || 'Special Offer'}
            </Text>
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{getDiscountPercentage()}</Text>
            </View>
            <TouchableOpacity
              style={styles.shopNowButton}
              onPress={() => router.push('/products')}
            >
              <Text style={styles.shopNowText}>Shop Now</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {/* Imported Products & New Arrivals Row */}
        <View style={[styles.cardsRow, { zIndex: 10 }]}>
          {/* Imported Products Card */}
          <Animated.View
            style={{
              flex: 1,
              opacity: fadeAnim,
              transform: [{ translateX: slideAnim }, { scale: scaleAnim }],
            }}
          >
            <TouchableOpacity
              style={styles.importedCard}
              onPress={() => router.push('/products')}
              activeOpacity={0.8}
            >
              <View style={styles.importedLeft}>
                <Animated.View 
                  style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    marginBottom: 6,
                    opacity: fadeAnim,
                  }}
                >
                  <Text style={{ fontSize: 12, color: '#FFFFFF', marginRight: 3 }}>⬇️</Text>
                  <Text style={styles.importedTitle}>Premium Imports</Text>
                </Animated.View>
                <Animated.Text 
                  style={[
                    styles.importedSubtitle,
                    { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                  ]}
                >
                  Discover Global Quality
                </Animated.Text>
                <Animated.Text 
                  style={[
                    styles.importedText,
                    { opacity: fadeAnim }
                  ]}
                >
                  ✨ Exclusive international products
                </Animated.Text>
                <TouchableOpacity
                  style={styles.browseButton}
                  onPress={() => router.push('/products')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.browseButtonText}>Explore Now →</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.importedRight}>
                <ExpoImage
                  source={require('@/assets/images/dahi.png')}
                  style={styles.importedImage}
                  contentFit="cover"
                />
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* New Arrivals Card */}
          <TouchableOpacity
            style={styles.newArrivalsCard}
            onPress={() => router.push('/products?sortBy=createdAt&order=desc')}
            activeOpacity={0.8}
          >
            {newArrivals.length > 0 ? (
              <>
                <View style={styles.newArrivalsImageContainer}>
                  {newArrivals[currentSlide] && (
                    <View style={styles.carouselItem}>
                      {newArrivals[currentSlide]?.images && newArrivals[currentSlide].images.length > 0 ? (
                        <ExpoImage
                          source={{ uri: newArrivals[currentSlide].images[0] }}
                          style={styles.newArrivalImage}
                          contentFit="contain"
                          placeholder={require('@/assets/images/icon.png')}
                          transition={200}
                          onError={(error) => {
                            console.error('Error loading new arrival image:', error);
                          }}
                        />
                      ) : (
                        <View style={styles.placeholderImage} />
                      )}
                    </View>
                  )}
                </View>
                <View style={styles.newArrivalsContent}>
                  <Text style={styles.newArrivalsTitle}>New Arrivals</Text>
                  <View style={{ flex: 1 }} />
                  <TouchableOpacity
                    style={styles.shopNowButton}
                    onPress={() => router.push('/products?sortBy=createdAt&order=desc')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.shopNowButtonText}>Shop Now</Text>
                  </TouchableOpacity>
                </View>
                {newArrivals.length > 1 && (
                  <View style={styles.carouselDots}>
                    {newArrivals.slice(0, 3).map((_, index) => (
                      <View
                        key={index}
                        style={[
                          styles.dot,
                          index === currentSlide && styles.dotActive,
                        ]}
                      />
                    ))}
                  </View>
                )}
              </>
            ) : (
              <View style={styles.emptyNewArrivals}>
                <Text style={styles.emptyText}>No new arrivals</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Popular Categories */}
        <View style={[styles.categoriesSection, { zIndex: 10 }]}>
          <Text style={styles.sectionTitle}>Explore Popular Categories</Text>
          {loading ? (
            <View style={styles.categoriesGrid}>
              {categories.slice(0, 4).map((_, index) => (
                <View key={index} style={styles.categoryCardSkeleton}>
                  <ActivityIndicator size="small" color="#16A34A" />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.categoriesGrid}>
              {categories.slice(0, 4).map((category, index) => {
                const categoryData = categoryProducts.find((cp) => cp.category === category.name);
                const product = categoryData?.products?.[0] || null;
                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.categoryCard}
                    onPress={() => router.push(`/products?category=${encodeURIComponent(category.categoryName)}`)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.categoryImageContainer}>
                      {product && product.images && product.images.length > 0 ? (
                        <ExpoImage
                          source={{ uri: product.images[0] }}
                          style={styles.categoryImage}
                          contentFit="cover"
                          placeholder={require('@/assets/images/icon.png')}
                          transition={200}
                          onError={(error) => {
                            console.error('Error loading category image:', error);
                          }}
                        />
                      ) : (
                        <View style={styles.categoryPlaceholder} />
                      )}
                    </View>
                    <Text style={styles.categoryName} numberOfLines={2}>
                      {category.name}
                    </Text>
                    {product && (
                      <Text style={styles.categoryProductName} numberOfLines={1}>
                        {product.name}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </View>

      {/* Best Sellers Section */}
      <BestSellers />

      {/* Top Sellers Section */}
      <TopSellers />

      {/* Recent Products Section */}
      <RecentProducts />

      {/* Shop by Category Section */}
      <View style={[styles.shopByCategorySection, { position: 'relative' }]}>
        {/* Background Images */}
        <SectionBackground opacity={0.15} imagesPerRow={3} />
        <View style={[styles.sectionHeader, { zIndex: 10 }]}>
          <Text style={styles.sectionTitleLarge}>Shop by Category</Text>
          <Text style={styles.sectionSubtitle}>
            Browse thousands of products across multiple categories
          </Text>
        </View>
        {loading ? (
          <View style={[styles.loadingContainer, { zIndex: 10 }]}>
            <ActivityIndicator size="large" color="#16A34A" />
          </View>
        ) : (
          <View style={[styles.categoryList, { zIndex: 10 }]}>
            {categoryProducts.map((categoryData, i) => (
              <View key={i} style={styles.categorySectionCard}>
                <View style={styles.categorySectionHeader}>
                  <View>
                    <Text style={styles.categorySectionTitle}>{categoryData.category}</Text>
                    <Text style={styles.categorySectionSubtitle}>
                      {categoryData.total > 0 ? `${categoryData.total}+ Items Available` : 'No items available'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.viewAllButton}
                    onPress={() => router.push(`/products?category=${encodeURIComponent(categoryData.categoryName)}`)}
                  >
                    <Text style={styles.viewAllText}>View All</Text>
                  </TouchableOpacity>
                </View>
                {categoryData.products.length > 0 ? (
                  <View style={styles.categoryProductsGrid}>
                    {categoryData.products.map((product, j) => (
                      <TouchableOpacity
                        key={j}
                        style={styles.categoryProductCard}
                        onPress={() => router.push(`/products/${product._id}`)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.categoryProductImageContainer}>
                          {product.images && product.images.length > 0 ? (
                            <ExpoImage
                              source={{ uri: product.images[0] }}
                              style={styles.categoryProductImage}
                              contentFit="contain"
                              placeholder={require('@/assets/images/icon.png')}
                              transition={200}
                              onError={(error) => {
                                console.error('Error loading category product image:', error);
                              }}
                            />
                          ) : (
                            <View style={styles.categoryProductPlaceholder} />
                          )}
                          {product.onSale && (
                            <View style={styles.saleBadge}>
                              <Text style={styles.saleBadgeText}>SALE</Text>
                            </View>
                          )}
                        </View>
                        <View style={styles.categoryProductInfo}>
                          <Text style={styles.categoryProductName} numberOfLines={2}>
                            {product.name}
                          </Text>
                          <Text style={styles.categoryProductPrice}>
                            {formatPrice(product.price)}
                          </Text>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <Text style={styles.categoryProductOriginalPrice}>
                              {formatPrice(product.originalPrice)}
                            </Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <View style={styles.emptyCategory}>
                    <Text style={styles.emptyCategoryText}>
                      No products available in this category yet.
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </View>

      {/* About Section */}
      <View style={[styles.aboutSection, { position: 'relative', zIndex: 10 }]}>
        <Text style={styles.aboutTitle}>About da-hi Marketplace</Text>
        <Text style={[styles.aboutSubtitle, { marginBottom: 16 }]}>
          Ethiopia's trusted online shopping destination.
        </Text>
        <Text style={styles.aboutText}>
          We connect verified local sellers with buyers across the country through a secure, easy-to-use marketplace. From everyday essentials to pre-order and imported products, da-hi Marketplace makes buying and selling simple, safe, and reliable.
        </Text>
        <Text style={[styles.aboutTagline, { marginTop: 16, marginBottom: 24 }]}>
          Shop with confidence. Sell with ease.
        </Text>
        <TouchableOpacity
          style={styles.learnMoreButton}
          onPress={() => router.push('/about')}
        >
          <Text style={styles.learnMoreText}>Learn More</Text>
        </TouchableOpacity>
      </View>

      </ScrollView>

      {/* Communication Widget - Floating Button (outside ScrollView for proper positioning) */}
      <CommunicationWidget />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollView: {
    flex: 1,
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderBottomWidth: 1,
    borderBottomColor: '#FECACA',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorContent: {
    flex: 1,
    marginRight: 8,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    marginBottom: 4,
  },
  errorSubtext: {
    color: '#991B1B',
    fontSize: 10,
    fontStyle: 'italic',
  },
  retryButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  heroSection: {
    padding: 16,
    backgroundColor: 'rgba(249, 250, 251, 0.8)',
    position: 'relative',
  },
  promoBanner: {
    height: 400,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    position: 'relative',
  },
  promoImage: {
    width: '100%',
    height: '100%',
  },
  promoGradient: {
    width: '100%',
    height: '100%',
    backgroundColor: '#16A34A',
  },
  promoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  promoContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    zIndex: 10,
  },
  promoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  promoBadgeText: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 8,
  },
  promoBadgeSubtext: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: '500',
  },
  promoTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  discountBadge: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  discountText: {
    color: '#16A34A',
    fontSize: 14,
    fontWeight: 'bold',
  },
  shopNowButton: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  shopNowText: {
    color: '#16A34A',
    fontSize: 14,
    fontWeight: '600',
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  importedCard: {
    flex: 1,
    height: 260,
    borderRadius: 12,
    overflow: 'hidden',
    flexDirection: 'row',
    backgroundColor: '#16A34A',
  },
  importedLeft: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  importedTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  importedSubtitle: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 1,
  },
  importedText: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  browseButton: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
  },
  browseButtonText: {
    color: '#16A34A',
    fontSize: 10,
    fontWeight: 'bold',
  },
  importedRight: {
    width: '50%',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  importedImage: {
    width: '100%',
    height: '100%',
  },
  newArrivalsCard: {
    flex: 1,
    height: 260,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    flexDirection: 'row',
  },
  newArrivalsImageContainer: {
    width: '50%',
    height: '100%',
    overflow: 'hidden',
    backgroundColor: '#F9FAFB',
  },
  carouselItem: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  newArrivalImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F9FAFB',
  },
  newArrivalsContent: {
    width: '50%',
    padding: 12,
    height: '100%',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  newArrivalsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  newArrivalsSubtitle: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 4,
  },
  newArrivalsProductName: {
    fontSize: 9,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  carouselIndicator: {
    fontSize: 8,
    color: '#6B7280',
  },
  carouselDots: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    flexDirection: 'row',
    gap: 6,
  },
  shopNowButton: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-end',
  },
  shopNowButtonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  dotActive: {
    width: 24,
    backgroundColor: '#16A34A',
  },
  emptyNewArrivals: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  emptyText: {
    fontSize: 10,
    color: '#6B7280',
  },
  categoriesSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryCard: {
    width: (width - 48) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryCardSkeleton: {
    width: (width - 48) / 2,
    height: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryImageContainer: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#F9FAFB',
    marginBottom: 6,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F9FAFB',
  },
  categoryName: {
    fontSize: 10,
    fontWeight: '500',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
  },
  categoryProductName: {
    fontSize: 9,
    color: '#6B7280',
    textAlign: 'center',
  },
  shopByCategorySection: {
    padding: 16,
    backgroundColor: 'rgba(249, 250, 251, 0.85)',
    minHeight: 200,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitleLarge: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  categoryList: {
    gap: 16,
  },
  categorySectionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categorySectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  categorySectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  categorySectionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  viewAllButton: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewAllText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  categoryProductsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryProductCard: {
    width: (width - 80) / 2,
    backgroundColor: 'rgba(249, 250, 251, 0.7)',
    borderRadius: 8,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  categoryProductImageContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  categoryProductImage: {
    width: '100%',
    height: '100%',
  },
  categoryProductPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E7EB',
  },
  saleBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  saleBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
  categoryProductInfo: {
    flex: 1,
    padding: 8,
    justifyContent: 'space-between',
  },
  categoryProductName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  categoryProductPrice: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#16A34A',
  },
  categoryProductOriginalPrice: {
    fontSize: 9,
    color: '#6B7280',
    textDecorationLine: 'line-through',
  },
  emptyCategory: {
    padding: 32,
    alignItems: 'center',
  },
  emptyCategoryText: {
    fontSize: 14,
    color: '#6B7280',
  },
  aboutSection: {
    padding: 32,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
  },
  aboutTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  aboutSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  aboutText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  aboutTagline: {
    fontSize: 16,
    fontWeight: '600',
    color: '#16A34A',
    textAlign: 'center',
  },
  learnMoreButton: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  learnMoreText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
