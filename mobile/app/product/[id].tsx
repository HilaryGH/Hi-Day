import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image as ExpoImage } from 'expo-image';
import { useAuth } from '@/context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { productsAPI, cartAPI } from '@/utils/api';

const { width } = Dimensions.get('window');

const ProductDetail = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadProduct();
    } else {
      setError('Product ID is missing');
      setLoading(false);
    }
  }, [params.id]);

  const loadProduct = async () => {
    if (!params.id) {
      setError('Product ID is missing');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await productsAPI.getOne(params.id);
      
      if (data && data._id) {
        if (!data.name || data.price === undefined || data.price === null) {
          setError('Product data is incomplete');
          return;
        }
        setProduct(data);
      } else {
        setError('Product not found');
      }
    } catch (err: any) {
      console.error('Error loading product:', err);
      const errorMessage = err?.message || 'Failed to load product. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!product) {
      return;
    }

    try {
      setAddingToCart(true);
      await cartAPI.add(product._id, quantity);
      Alert.alert('Success', 'Product added to cart!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    if (!user) {
      router.push('/login');
      return;
    }

    router.push({
      pathname: '/checkout',
      params: {
        product: JSON.stringify({
          _id: product._id,
          id: product._id,
          name: product.name,
          price: product.price,
          images: product.images,
          quantity: quantity,
        }),
        fromCart: 'false',
      },
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#16A34A" />
        <Text style={styles.loadingText}>Loading product...</Text>
      </View>
    );
  }

  if (error || (!loading && !product)) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Product Not Found</Text>
        <Text style={styles.errorText}>
          {error || 'The product you are looking for does not exist or has been removed.'}
        </Text>
        <View style={styles.errorActions}>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() => router.push('/products')}
          >
            <Text style={styles.errorButtonText}>Browse Products</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.errorButton, styles.errorButtonSecondary]}
            onPress={() => router.back()}
          >
            <Text style={[styles.errorButtonText, styles.errorButtonTextSecondary]}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Product Images */}
        <View style={styles.imageContainer}>
          {product.images && product.images.length > 0 ? (
            <>
              <ExpoImage
                source={{ uri: product.images[selectedImage] }}
                style={styles.mainImage}
                contentFit="cover"
                placeholder={require('@/assets/images/icon.png')}
              />
              {product.images.length > 1 && (
                <ScrollView 
                  horizontal 
                  style={styles.thumbnailContainer}
                  showsHorizontalScrollIndicator={false}
                >
                  {product.images.map((image: string, index: number) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setSelectedImage(index)}
                      style={[
                        styles.thumbnail,
                        selectedImage === index && styles.thumbnailSelected,
                      ]}
                    >
                      <ExpoImage
                        source={{ uri: image }}
                        style={styles.thumbnailImage}
                        contentFit="cover"
                        placeholder={require('@/assets/images/icon.png')}
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </>
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>No Image</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.productName}>{product.name}</Text>
          
          {product.seller?.name && (
            <Text style={styles.sellerName}>by {product.seller.name}</Text>
          )}

          <View style={styles.priceContainer}>
            <Text style={styles.price}>ETB {product.price?.toLocaleString()}</Text>
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <Text style={styles.originalPrice}>
                  ETB {product.originalPrice.toLocaleString()}
                </Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </Text>
                </View>
              </>
            )}
          </View>

          {product.rating && (
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingText}>
                ⭐ {product.rating.average?.toFixed(1) || '0.0'} ({product.rating.count || 0} reviews)
              </Text>
            </View>
          )}

          {product.stock !== undefined && (
            <View style={styles.stockContainer}>
              <Text style={styles.stockLabel}>Stock:</Text>
              <Text style={[styles.stockValue, product.stock > 0 ? styles.stockInStock : styles.stockOutOfStock]}>
                {product.stock > 0 ? `${product.stock} available` : 'Out of Stock'}
              </Text>
            </View>
          )}

          {product.category && (
            <View style={styles.categoryContainer}>
              <Text style={styles.categoryLabel}>Category:</Text>
              <Text style={styles.categoryValue}>{product.category}</Text>
            </View>
          )}

          {product.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionTitle}>Description</Text>
              <Text style={styles.descriptionText}>{product.description}</Text>
            </View>
          )}

          {/* Quantity Selector */}
          <View style={styles.quantityContainer}>
            <Text style={styles.quantityLabel}>Quantity:</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Text style={styles.quantityButtonText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.quantityValue}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.addToCartButton]}
          onPress={handleAddToCart}
          disabled={addingToCart || (product.stock !== undefined && product.stock === 0)}
        >
          {addingToCart ? (
            <ActivityIndicator color="#16A34A" />
          ) : (
            <Text style={styles.addToCartButtonText}>Add to Cart</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.buyNowButton]}
          onPress={handleBuyNow}
          disabled={product.stock !== undefined && product.stock === 0}
        >
          <Text style={styles.buyNowButtonText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#16A34A',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageContainer: {
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  mainImage: {
    width: width,
    height: width,
    backgroundColor: '#F3F4F6',
  },
  thumbnailContainer: {
    padding: 12,
    gap: 8,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    marginRight: 8,
  },
  thumbnailSelected: {
    borderColor: '#16A34A',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  placeholderImage: {
    width: width,
    height: width,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  infoContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  sellerName: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#16A34A',
  },
  originalPrice: {
    fontSize: 18,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
  },
  ratingContainer: {
    marginBottom: 12,
  },
  ratingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stockLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
  stockValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  stockInStock: {
    color: '#16A34A',
  },
  stockOutOfStock: {
    color: '#DC2626',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
  categoryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  descriptionContainer: {
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    minWidth: 30,
    textAlign: 'center',
  },
  actionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  addToCartButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#16A34A',
  },
  addToCartButtonText: {
    color: '#16A34A',
    fontSize: 16,
    fontWeight: '600',
  },
  buyNowButton: {
    backgroundColor: '#16A34A',
  },
  buyNowButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  errorActions: {
    flexDirection: 'row',
    gap: 12,
  },
  errorButton: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorButtonSecondary: {
    backgroundColor: '#E5E7EB',
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorButtonTextSecondary: {
    color: '#374151',
  },
});

export default ProductDetail;
