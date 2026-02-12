import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { productsAPI } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';

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

interface ProductListingFormProps {
  onSuccess?: () => void;
  product?: any; // Product to edit (if provided, form will be in edit mode)
}

const ProductListingForm = ({ onSuccess, product }: ProductListingFormProps) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'super admin';
  const isEditMode = !!product;

  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price?.toString() || '',
    originalPrice: product?.originalPrice?.toString() || '',
    images: [] as any[],
    category: product?.category || '',
    brand: product?.brand || '',
    stock: product?.stock?.toString() || '',
    isImported: product?.isImported || false,
  });
  const [existingImages, setExistingImages] = useState<string[]>(product?.images || []);
  const [imagesToKeep, setImagesToKeep] = useState<boolean[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize when product is provided
  useEffect(() => {
    if (product?.images) {
      setExistingImages(product.images);
      setImagesToKeep(new Array(product.images.length).fill(true));
    }
  }, [product]);

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        const newImages = result.assets.slice(0, 5);
        setFormData({ ...formData, images: [...formData.images, ...newImages].slice(0, 5) });
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert('Error', 'Failed to pick images');
    }
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  const handleSubmit = async () => {
    setError('');

    // Validation
    if (!formData.name.trim()) {
      setError('Product name is required');
      return;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('Valid price is required');
      return;
    }
    if (!formData.category) {
      setError('Category is required');
      return;
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      setError('Valid stock quantity is required');
      return;
    }
    // In edit mode, allow keeping existing images even if no new images are uploaded
    const keptExistingImages = existingImages.filter((_, index) => imagesToKeep[index]);
    
    if (!isEditMode && formData.images.length === 0) {
      setError('At least one image is required');
      return;
    }
    
    if (isEditMode && formData.images.length === 0 && keptExistingImages.length === 0) {
      setError('At least one product image is required. Keep existing images or upload new ones.');
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('price', formData.price);
      if (formData.originalPrice) {
        formDataToSend.append('originalPrice', formData.originalPrice);
      }
      formDataToSend.append('category', formData.category);
      if (formData.brand) {
        formDataToSend.append('brand', formData.brand.trim());
      }
      formDataToSend.append('stock', formData.stock);
      if (isAdmin) {
        formDataToSend.append('isImported', formData.isImported ? 'true' : 'false');
      }

      // In edit mode, handle image keeping
      if (isEditMode) {
        // If we have existing images to keep AND new images, merge them
        if (keptExistingImages.length > 0 && formData.images.length > 0) {
          formDataToSend.append('keepExistingImages', 'true');
        }
        // If only keeping existing images (no new uploads)
        if (keptExistingImages.length > 0 && formData.images.length === 0) {
          formDataToSend.append('existingImages', JSON.stringify(keptExistingImages));
        }
      }

      // Add new image files
      formData.images.forEach((image, index) => {
        const uri = image.uri;
        const filename = uri.split('/').pop() || `image${index}.jpg`;
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        formDataToSend.append('images', {
          uri,
          name: filename,
          type,
        } as any);
      });

      if (isEditMode && product?._id) {
        await productsAPI.update(product._id, formDataToSend);
        Alert.alert('Success', 'Product updated successfully!', [
          {
            text: 'OK',
            onPress: () => {
              if (onSuccess) {
                onSuccess();
              }
            },
          },
        ]);
      } else {
        await productsAPI.create(formDataToSend);
        // Reset form only if not in edit mode
        setFormData({
          name: '',
          description: '',
          price: '',
          originalPrice: '',
          images: [],
          category: '',
          brand: '',
          stock: '',
          isImported: false,
        });
        setExistingImages([]);
        setImagesToKeep([]);
        Alert.alert('Success', 'Product listed successfully!', [
          {
            text: 'OK',
            onPress: () => {
              if (onSuccess) {
                onSuccess();
              }
            },
          },
        ]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create product');
      Alert.alert('Error', err.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Product Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter product name"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter product description"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Price (ETB) *</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              value={formData.price}
              onChangeText={(text) => setFormData({ ...formData, price: text })}
              keyboardType="decimal-pad"
            />
          </View>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Original Price (ETB)</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              value={formData.originalPrice}
              onChangeText={(text) => setFormData({ ...formData, originalPrice: text })}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  formData.category === category && styles.categoryChipActive,
                ]}
                onPress={() => setFormData({ ...formData, category })}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    formData.category === category && styles.categoryChipTextActive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Brand</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter brand name"
              value={formData.brand}
              onChangeText={(text) => setFormData({ ...formData, brand: text })}
            />
          </View>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Stock *</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              value={formData.stock}
              onChangeText={(text) => setFormData({ ...formData, stock: text })}
              keyboardType="number-pad"
            />
          </View>
        </View>

        {isAdmin && (
          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setFormData({ ...formData, isImported: !formData.isImported })}
            >
              <View
                style={[
                  styles.checkboxBox,
                  formData.isImported && styles.checkboxBoxChecked,
                ]}
              >
                {formData.isImported && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Mark as Imported Product</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Product Images * (up to 5)</Text>
          {isEditMode && existingImages.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>Current Images:</Text>
              <View style={styles.imagesContainer}>
                {existingImages.map((imgUrl, index) => (
                  imagesToKeep[index] && (
                    <View key={`existing-${index}`} style={styles.imageWrapper}>
                      <ExpoImage
                        source={{ uri: imgUrl }}
                        style={styles.imagePreview}
                        contentFit="cover"
                      />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => {
                          const newKeep = [...imagesToKeep];
                          newKeep[index] = false;
                          setImagesToKeep(newKeep);
                        }}
                      >
                        <Text style={styles.removeImageText}>×</Text>
                      </TouchableOpacity>
                      <Text style={styles.imageLabel}>Current</Text>
                    </View>
                  )
                ))}
              </View>
            </>
          )}
          <TouchableOpacity style={styles.imagePickerButton} onPress={handleImagePick}>
            <Text style={styles.imagePickerText}>
              {isEditMode ? 'Add New Images' : 'Pick Images'}
            </Text>
          </TouchableOpacity>
          {formData.images.length > 0 && (
            <View style={styles.imagesContainer}>
              {formData.images.map((image, index) => (
                <View key={`new-${index}`} style={styles.imageWrapper}>
                  <ExpoImage
                    source={{ uri: image.uri }}
                    style={styles.imagePreview}
                    contentFit="cover"
                  />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                  >
                    <Text style={styles.removeImageText}>×</Text>
                  </TouchableOpacity>
                  <Text style={styles.imageLabel}>New</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>
              {isEditMode ? 'Update Product' : 'List Product'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  categoryScroll: {
    flexDirection: 'row',
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
  },
  checkboxContainer: {
    marginBottom: 20,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxBoxChecked: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#374151',
  },
  imagePickerButton: {
    backgroundColor: '#16A34A',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  imagePickerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageWrapper: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    marginTop: 8,
  },
  imageLabel: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    color: '#FFFFFF',
    fontSize: 10,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  submitButton: {
    backgroundColor: '#16A34A',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ProductListingForm;
