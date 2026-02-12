import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Image as ExpoImage } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import Avatar from './Avatar';

const categories = [
  'Fashion & Apparel',
  'Electronics',
  'Home & Living',
  'Beauty & Personal Care',
  'Sports & Outdoors',
  'Books',
  'Toys & Games',
  'Food & Beverages',
];

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchModalVisible(false);
    }
  };

  const isHome = pathname === '/';

  return (
    <>
      <View style={[styles.navbar, { paddingTop: insets.top }]}>
        <View style={styles.navbarContent}>
          {/* Logo */}
          <TouchableOpacity
            onPress={() => router.push('/')}
            style={styles.logoContainer}
            activeOpacity={0.7}
          >
            <ExpoImage
              source={require('@/assets/images/dahi logo.png')}
              style={styles.logo}
              contentFit="contain"
            />
          </TouchableOpacity>

          {/* Right Section */}
          <View style={styles.rightSection}>
            {/* Search Icon */}
            <TouchableOpacity
              onPress={() => setSearchModalVisible(true)}
              style={styles.iconButton}
              activeOpacity={0.7}
            >
              <Text style={styles.icon}>🔍</Text>
            </TouchableOpacity>

            {/* Cart Icon */}
            <TouchableOpacity
              onPress={() => router.push('/cart')}
              style={styles.iconButton}
              activeOpacity={0.7}
            >
              <Text style={styles.icon}>🛒</Text>
            </TouchableOpacity>

            {/* User Avatar or Menu Icon */}
            {user ? (
              <TouchableOpacity
                onPress={() => setMenuVisible(true)}
                style={styles.avatarButton}
                activeOpacity={0.7}
              >
                <Avatar user={user} size={36} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => setMenuVisible(true)}
                style={styles.iconButton}
                activeOpacity={0.7}
              >
                <Text style={styles.icon}>☰</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Search Bar - Mobile */}
        {isHome && (
          <TouchableOpacity
            onPress={() => setSearchModalVisible(true)}
            style={styles.searchBar}
            activeOpacity={0.7}
          >
            <Text style={styles.searchPlaceholder}>Search for products...</Text>
            <Text style={styles.searchIcon}>🔍</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Categories Below Search Input - Mobile */}
      {isHome && (
        <View style={styles.categoriesContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScrollContent}
            style={styles.categoriesScroll}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={styles.categoryChip}
                onPress={() => router.push(`/products?category=${encodeURIComponent(category)}`)}
                activeOpacity={0.8}
              >
                <Text style={styles.categoryChipText}>{category}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Search Modal */}
      <Modal
        visible={searchModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSearchModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Search Products</Text>
              <TouchableOpacity
                onPress={() => setSearchModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.searchInputContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search for products..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
                autoFocus
              />
              <TouchableOpacity
                onPress={handleSearch}
                style={styles.searchButton}
                activeOpacity={0.7}
              >
                <Text style={styles.searchButtonText}>Search</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Menu Modal */}
      <Modal
        visible={menuVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.menuContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Menu</Text>
              <TouchableOpacity
                onPress={() => setMenuVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.menuItems}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  router.push('/');
                  setMenuVisible(false);
                }}
              >
                <Text style={styles.menuItemText}>🏠 Home</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  router.push('/products');
                  setMenuVisible(false);
                }}
              >
                <Text style={styles.menuItemText}>📦 Products</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  router.push('/cart');
                  setMenuVisible(false);
                }}
              >
                <Text style={styles.menuItemText}>🛒 Cart</Text>
              </TouchableOpacity>
              {user ? (
                <>
                  <View style={styles.menuUserInfo}>
                    <Avatar user={user} size={60} />
                    <View style={styles.menuUserTextContainer}>
                      <Text style={styles.menuUserName}>{user.name || user.email}</Text>
                      <Text style={styles.menuUserRole}>{user.role}</Text>
                    </View>
                  </View>
                  {(user.role === 'product provider' || user.role === 'seller') && (
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => {
                        router.push('/provider-dashboard');
                        setMenuVisible(false);
                      }}
                    >
                      <Text style={styles.menuItemText}>📊 Provider Dashboard</Text>
                    </TouchableOpacity>
                  )}
                  {(user.role === 'admin' || user.role === 'super admin') && (
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => {
                        router.push('/admin-dashboard');
                        setMenuVisible(false);
                      }}
                    >
                      <Text style={styles.menuItemText}>⚙️ Admin Dashboard</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      logout();
                      setMenuVisible(false);
                    }}
                  >
                    <Text style={styles.menuItemText}>🚪 Sign Out</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      router.push('/login');
                      setMenuVisible(false);
                    }}
                  >
                    <Text style={styles.menuItemText}>👤 Sign In</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      router.push('/register');
                      setMenuVisible(false);
                    }}
                  >
                    <Text style={styles.menuItemText}>➕ Create Account</Text>
                  </TouchableOpacity>
                </>
              )}
              <View style={styles.menuDivider} />
              <Text style={styles.menuSectionTitle}>Categories</Text>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={styles.menuItem}
                  onPress={() => {
                    router.push(`/products?category=${encodeURIComponent(category)}`);
                    setMenuVisible(false);
                  }}
                >
                  <Text style={styles.menuItemText}>{category}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  navbar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 50,
  },
  navbarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 56,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    height: 40,
    width: 120,
    maxWidth: 120,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 8,
  },
  icon: {
    fontSize: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchPlaceholder: {
    flex: 1,
    color: '#6B7280',
    fontSize: 14,
  },
  searchIcon: {
    fontSize: 18,
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
    padding: 20,
    paddingBottom: 40,
  },
  menuContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
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
    color: '#6B7280',
  },
  searchInputContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#D1D5DB',
    color: '#1F2937',
    placeholderTextColor: '#6B7280',
  },
  searchButton: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  menuItems: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  menuItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemText: {
    fontSize: 16,
    color: '#111827',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  menuSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 8,
  },
  menuUserTextContainer: {
    flex: 1,
  },
  menuUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  avatarButton: {
    padding: 4,
  },
  menuUserRole: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  categoriesContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 8,
  },
  categoriesScroll: {
    flexGrow: 0,
  },
  categoriesScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    flexShrink: 0,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
});

export default Navbar;
