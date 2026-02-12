import { useState, useEffect } from 'react';
import { productsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

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

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  originalPrice: string;
  images: (File | null)[];
  category: string;
  subcategory: string;
  brand: string;
  stock: string;
  specifications: { [key: string]: string };
  tags: string[];
  isImported: boolean;
}

interface ProductListingFormProps {
  onSuccess?: () => void;
  product?: any; // Product to edit (if provided, form will be in edit mode)
}

const ProductListingForm = ({ onSuccess, product }: ProductListingFormProps) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'super admin';
  const isEditMode = !!product;
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price?.toString() || '',
    originalPrice: product?.originalPrice?.toString() || '',
    images: product?.images?.map(() => null) || [null], // Placeholders for existing images
    category: product?.category || '',
    subcategory: product?.subcategory || '',
    brand: product?.brand || '',
    stock: product?.stock?.toString() || '',
    specifications: product?.specifications ? Object.fromEntries(product.specifications) : {},
    tags: product?.tags || [],
    isImported: product?.isImported || false,
  });

  // Store existing image URLs for display
  const [existingImages, setExistingImages] = useState<string[]>(product?.images || []);

  const [specKey, setSpecKey] = useState('');
  const [specValue, setSpecValue] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<{ [key: number]: string }>({});
  const [imagesToKeep, setImagesToKeep] = useState<boolean[]>([]); // Track which existing images to keep

  // Initialize imagesToKeep when product is loaded
  useEffect(() => {
    if (product?.images) {
      setImagesToKeep(new Array(product.images.length).fill(true));
      // Initialize formData.images with placeholders for existing images
      setFormData(prev => ({
        ...prev,
        images: new Array(product.images.length).fill(null)
      }));
    }
  }, [product]);

  // Update preview URLs when images change
  useEffect(() => {
    const previews: { [key: number]: string } = {};
    formData.images.forEach((image, index) => {
      if (image) {
        previews[index] = URL.createObjectURL(image);
      } else if (existingImages[index] && imagesToKeep[index]) {
        // Show existing image if no new file is selected
        previews[index] = existingImages[index];
      }
    });
    
    setImagePreviews(prevPreviews => {
      // Clean up old previews (only object URLs, not existing image URLs)
      Object.values(prevPreviews).forEach((url) => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
      return previews;
    });
    
    // Cleanup on unmount
    return () => {
      Object.values(previews).forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [formData.images.map(img => img ? `${img.name}-${img.size || 0}` : '').join(','), existingImages, imagesToKeep]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (index: number, file: File | null) => {
    const newImages = [...formData.images];
    newImages[index] = file;
    setFormData({ ...formData, images: newImages });
  };

  const addImageField = () => {
    if (formData.images.length < 5) {
      setFormData({ ...formData, images: [...formData.images, null] });
    }
  };

  const removeImageField = (index: number) => {
    if (formData.images.length > 1) {
      const newImages = formData.images.filter((_, i) => i !== index);
      setFormData({ ...formData, images: newImages });
    }
  };

  const addSpecification = () => {
    if (specKey && specValue) {
      setFormData({
        ...formData,
        specifications: { ...formData.specifications, [specKey]: specValue },
      });
      setSpecKey('');
      setSpecValue('');
    }
  };

  const removeSpecification = (key: string) => {
    const newSpecs = { ...formData.specifications };
    delete newSpecs[key];
    setFormData({ ...formData, specifications: newSpecs });
  };

  const addTag = () => {
    if (tagInput && !formData.tags.includes(tagInput)) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput] });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (!formData.name.trim()) {
      setError('Product name is required');
      return;
    }
    if (!formData.description.trim()) {
      setError('Product description is required');
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
    const validImages = formData.images.filter((img) => img !== null);
    const keptExistingImages = existingImages.filter((_, index) => imagesToKeep[index]);
    
    if (!isEditMode && validImages.length === 0) {
      setError('At least one product image is required');
      return;
    }
    
    if (isEditMode && validImages.length === 0 && keptExistingImages.length === 0) {
      setError('At least one product image is required. Keep existing images or upload new ones.');
      return;
    }

    setLoading(true);

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add text fields
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('price', formData.price);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('stock', formData.stock);
      
      if (formData.originalPrice && parseFloat(formData.originalPrice) > 0) {
        formDataToSend.append('originalPrice', formData.originalPrice);
      }
      if (formData.subcategory.trim()) {
        formDataToSend.append('subcategory', formData.subcategory.trim());
      }
      if (formData.brand.trim()) {
        formDataToSend.append('brand', formData.brand.trim());
      }
      if (Object.keys(formData.specifications).length > 0) {
        formDataToSend.append('specifications', JSON.stringify(formData.specifications));
      }
      if (formData.tags.length > 0) {
        formDataToSend.append('tags', JSON.stringify(formData.tags));
      }
      
      // Add isImported field (only for admins and super admins)
      if (isAdmin && formData.isImported) {
        formDataToSend.append('isImported', 'true');
      }
      
      // In edit mode, handle image keeping
      if (isEditMode) {
        // If we have existing images to keep AND new images, merge them
        if (keptExistingImages.length > 0 && validImages.length > 0) {
          formDataToSend.append('keepExistingImages', 'true');
        }
        // If only keeping existing images (no new uploads), we need to send a flag
        // The backend will handle this by checking if files are present
        if (keptExistingImages.length > 0 && validImages.length === 0) {
          // No new images, but keeping existing ones - backend should preserve them
          // We'll send the existing image URLs as a special field
          formDataToSend.append('existingImages', JSON.stringify(keptExistingImages));
        }
      }
      
      // Add image files (only new ones)
      validImages.forEach((image) => {
        if (image) {
          formDataToSend.append('images', image);
        }
      });

      if (isEditMode && product?._id) {
        await productsAPI.update(product._id, formDataToSend);
      } else {
        await productsAPI.create(formDataToSend);
      }
      
      setSuccess(true);
      
      // Reset form only if not in edit mode
      if (!isEditMode) {
        setFormData({
          name: '',
          description: '',
          price: '',
          originalPrice: '',
          images: [null],
          category: '',
          subcategory: '',
          brand: '',
          stock: '',
          specifications: {},
          tags: [],
          isImported: false,
        });
        setExistingImages([]);
        setImagesToKeep([]);
      }

      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removeExistingImage = (index: number) => {
    const newKeep = [...imagesToKeep];
    newKeep[index] = false;
    setImagesToKeep(newKeep);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {isEditMode ? 'Edit Product' : 'List a New Product'}
      </h2>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
          {isEditMode ? 'Product updated successfully!' : 'Product listed successfully! Redirecting...'}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Product Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#16A34A] focus:border-[#16A34A]"
            placeholder="Enter product name"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            value={formData.description}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#16A34A] focus:border-[#16A34A]"
            placeholder="Describe your product in detail"
          />
        </div>

        {/* Price and Original Price */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Price (ETB) <span className="text-red-500">*</span>
            </label>
            <input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              required
              value={formData.price}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#16A34A] focus:border-[#16A34A]"
              placeholder="0.00"
            />
          </div>
          <div>
            <label htmlFor="originalPrice" className="block text-sm font-medium text-gray-700 mb-1">
              Original Price (ETB) (Optional)
            </label>
            <input
              id="originalPrice"
              name="originalPrice"
              type="number"
              step="0.01"
              min="0"
              value={formData.originalPrice}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#16A34A] focus:border-[#16A34A]"
              placeholder="0.00"
            />
            <p className="mt-1 text-xs text-gray-500">For showing discount percentage</p>
          </div>
        </div>

        {/* Category and Subcategory */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              required
              value={formData.category}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#16A34A] focus:border-[#16A34A]"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 mb-1">
              Subcategory (Optional)
            </label>
            <input
              id="subcategory"
              name="subcategory"
              type="text"
              value={formData.subcategory}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#16A34A] focus:border-[#16A34A]"
              placeholder="e.g., Smartphones, Laptops"
            />
          </div>
        </div>

        {/* Brand and Stock */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
              Brand (Optional)
            </label>
            <input
              id="brand"
              name="brand"
              type="text"
              value={formData.brand}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#16A34A] focus:border-[#16A34A]"
              placeholder="Brand name"
            />
          </div>
          <div>
            <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
              Stock Quantity <span className="text-red-500">*</span>
            </label>
            <input
              id="stock"
              name="stock"
              type="number"
              min="0"
              required
              value={formData.stock}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#16A34A] focus:border-[#16A34A]"
              placeholder="0"
            />
          </div>
        </div>

        {/* Product Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Images <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 mb-2">
            {isEditMode 
              ? 'Upload new images to replace existing ones, or keep current images. At least one image is required (up to 5 images, max 5MB each).'
              : 'At least one image is required (up to 5 images, max 5MB each)'}
          </p>
          
          {/* Show existing images in edit mode */}
          {isEditMode && existingImages.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Current Images:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {existingImages.map((imgUrl, index) => (
                  imagesToKeep[index] && (
                    <div key={index} className="relative">
                      <img
                        src={imgUrl}
                        alt={`Current ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                      >
                        ×
                      </button>
                      <p className="text-xs text-gray-500 mt-1 text-center">Current Image</p>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}
          
          {/* Image upload fields */}
          {formData.images.map((image, index) => (
            <div key={index} className="mb-4">
              <div className="flex gap-2 mb-2">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    if (file) {
                      // Validate file size (5MB)
                      if (file.size > 5 * 1024 * 1024) {
                        setError(`Image ${index + 1} is too large. Maximum size is 5MB.`);
                        return;
                      }
                      handleImageChange(index, file);
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#16A34A] focus:border-[#16A34A] text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#16A34A] file:text-white hover:file:bg-[#15803D]"
                />
                {formData.images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImageField(index)}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                  >
                    Remove
                  </button>
                )}
              </div>
              {imagePreviews[index] && (
                <div className="mt-2">
                  <img
                    src={imagePreviews[index]}
                    alt={`Preview ${index + 1}`}
                    className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                  />
                  {image && (
                    <p className="text-xs text-gray-500 mt-1">{image.name} ({(image.size / 1024 / 1024).toFixed(2)} MB)</p>
                  )}
                </div>
              )}
            </div>
          ))}
          {formData.images.length < 5 && (
            <button
              type="button"
              onClick={addImageField}
              className="mt-2 text-sm text-[#16A34A] hover:text-[#15803D]"
            >
              + Add another image
            </button>
          )}
        </div>

        {/* Specifications */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Specifications (Optional)
          </label>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <input
              type="text"
              value={specKey}
              onChange={(e) => setSpecKey(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#16A34A] focus:border-[#16A34A]"
              placeholder="Key (e.g., Color)"
            />
            <input
              type="text"
              value={specValue}
              onChange={(e) => setSpecValue(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#16A34A] focus:border-[#16A34A]"
              placeholder="Value (e.g., Black)"
            />
          </div>
          <button
            type="button"
            onClick={addSpecification}
            className="mb-2 text-sm text-[#16A34A] hover:text-[#15803D]"
          >
            + Add Specification
          </button>
          {Object.keys(formData.specifications).length > 0 && (
            <div className="mt-2 space-y-1">
              {Object.entries(formData.specifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm">
                    <strong>{key}:</strong> {value}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeSpecification(key)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Imported Product Checkbox - Only for Admins and Super Admins */}
        {isAdmin && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="isImported"
                  name="isImported"
                  type="checkbox"
                  checked={formData.isImported}
                  onChange={(e) => setFormData({ ...formData, isImported: e.target.checked })}
                  className="h-5 w-5 text-[#16A34A] focus:ring-[#16A34A] border-gray-300 rounded cursor-pointer"
                />
              </div>
              <div className="ml-3 flex-1">
                <label htmlFor="isImported" className="font-bold text-lg text-gray-900 cursor-pointer flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Mark as Imported Product
                </label>
                <p className="text-gray-700 mt-1 font-medium">Check this box to mark this product as imported. Imported products will be featured in the homepage hero section.</p>
                {formData.isImported && (
                  <div className="mt-2 flex items-center gap-2 text-blue-700 font-semibold">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    This product will be marked as imported
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags (Optional)
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#16A34A] focus:border-[#16A34A]"
              placeholder="Enter tag and press Enter"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2 bg-[#16A34A] text-white rounded-md hover:bg-[#15803D]"
            >
              Add
            </button>
          </div>
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => {
              setFormData({
                name: '',
                description: '',
                price: '',
                originalPrice: '',
                images: [null],
                category: '',
                subcategory: '',
                brand: '',
                stock: '',
                specifications: {},
                tags: [],
                isImported: false,
              });
              setError('');
            }}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-[#16A34A] text-white rounded-md hover:bg-[#15803D] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading 
              ? (isEditMode ? 'Updating Product...' : 'Listing Product...') 
              : (isEditMode ? 'Update Product' : 'List Product')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductListingForm;

