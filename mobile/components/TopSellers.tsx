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
import { sellersAPI } from '@/utils/api';
import SectionBackground from './SectionBackground';

const { width } = Dimensions.get('window');

const TopSellers: React.FC = () => {
  const router = useRouter();
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchTopSellers = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await sellersAPI.getTopSellers(8);
        setSellers(response.sellers || []);
      } catch (error: any) {
        if (error?.status !== 404) {
          console.error('Error fetching top sellers:', error);
          setError(error.message || 'Failed to load top sellers');
        }
        setSellers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopSellers();
  }, []);

  const getDisplayName = (seller: any) => {
    return seller.companyName || seller.name || 'Unknown Seller';
  };

  const getLocation = (seller: any) => {
    const parts = [];
    if (seller.city) parts.push(seller.city);
    if (seller.location) parts.push(seller.location);
    return parts.length > 0 ? parts.join(', ') : 'Ethiopia';
  };

  return (
    <View style={[styles.container, { position: 'relative' }]}>
      {/* Background Images */}
      <SectionBackground opacity={0.15} imagesPerRow={3} />
      {/* Logo Display Above Section */}
      {!loading && sellers.length > 0 && sellers[0]?.avatar && (
        <View style={[styles.logoContainer, { zIndex: 10 }]}>
          <View style={styles.logoWrapper}>
            <ExpoImage
              source={{ uri: sellers[0].avatar }}
              style={styles.logoImage}
              contentFit="contain"
            />
            {sellers[0].isVerified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedIcon}>✓</Text>
              </View>
            )}
          </View>
        </View>
      )}

      <View style={[styles.header, { zIndex: 10 }]}>
        <Text style={styles.title}>Top Sellers</Text>
        {!loading && sellers.length > 0 && (
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => router.push('/products')}
          >
            <Text style={styles.viewAllButtonText}>View All</Text>
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <View style={[styles.errorContainer, { zIndex: 10 }]}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <Text style={styles.errorSubtext}>Please try refreshing the page.</Text>
        </View>
      )}

      {loading ? (
        <View style={[styles.loadingContainer, { zIndex: 10 }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sellersContainer}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <View key={item} style={styles.sellerCardSkeleton}>
                <ActivityIndicator size="small" color="#16A34A" />
              </View>
            ))}
          </ScrollView>
        </View>
      ) : sellers.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.sellersContainer, { zIndex: 10 }]}
        >
          {sellers.map((seller) => (
            <TouchableOpacity
              key={seller._id}
              style={styles.sellerCard}
              onPress={() => router.push(`/products?seller=${seller._id}`)}
              activeOpacity={0.7}
            >
              <View style={styles.sellerImageContainer}>
                  {seller.avatar ? (
                    <ExpoImage
                      source={{ uri: seller.avatar }}
                      style={styles.sellerImage}
                      contentFit="cover"
                      placeholder={require('@/assets/images/icon.png')}
                      transition={200}
                      onError={(error) => {
                        console.error('Error loading seller avatar:', seller.avatar, error);
                      }}
                    />
                  ) : (
                  <View style={styles.sellerPlaceholder}>
                    <Text style={styles.sellerInitial}>
                      {getDisplayName(seller).charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}

                {seller.isVerified && (
                  <View style={styles.verifiedBadgeSmall}>
                    <Text style={styles.verifiedIconSmall}>✓</Text>
                  </View>
                )}
              </View>

              <View style={styles.sellerInfo}>
                <Text style={styles.sellerName} numberOfLines={2}>
                  {getDisplayName(seller)}
                </Text>

                <View style={styles.locationContainer}>
                  <Text style={styles.locationIcon}>📍</Text>
                  <Text style={styles.locationText} numberOfLines={1}>
                    {getLocation(seller)}
                  </Text>
                </View>

                <View style={styles.statsContainer}>
                  {seller.productCount > 0 && (
                    <View style={styles.statItem}>
                      <Text style={styles.statIcon}>📦</Text>
                      <Text style={styles.statText}>{seller.productCount} Products</Text>
                    </View>
                  )}
                  {seller.avgRating > 0 && (
                    <View style={styles.statItem}>
                      <Text style={styles.statIcon}>⭐</Text>
                      <Text style={styles.statText}>{seller.avgRating.toFixed(1)}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.viewShopContainer}>
                  <Text style={styles.viewShopText}>View Shop →</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No top sellers available at the moment.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 32,
    backgroundColor: '#FFFFFF',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoWrapper: {
    position: 'relative',
  },
  logoImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#16A34A',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#16A34A',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedIcon: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewAllButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    padding: 16,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginBottom: 4,
  },
  errorSubtext: {
    fontSize: 12,
    color: '#6B7280',
  },
  loadingContainer: {
    paddingHorizontal: 16,
  },
  sellersContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  sellerCard: {
    width: width * 0.6,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sellerCardSkeleton: {
    width: width * 0.6,
    height: 280,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sellerImageContainer: {
    width: '100%',
    height: 120,
    backgroundColor: '#F9FAFB',
    position: 'relative',
  },
  sellerImage: {
    width: '100%',
    height: '100%',
  },
  sellerPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sellerInitial: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  verifiedBadgeSmall: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#16A34A',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedIconSmall: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sellerInfo: {
    padding: 12,
    marginTop: -20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  sellerName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  locationIcon: {
    fontSize: 12,
  },
  locationText: {
    fontSize: 11,
    color: '#6B7280',
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statIcon: {
    fontSize: 10,
  },
  statText: {
    fontSize: 10,
    color: '#6B7280',
  },
  viewShopContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  viewShopText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16A34A',
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

export default TopSellers;
