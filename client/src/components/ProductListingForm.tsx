import { useState, useEffect } from 'react';
import { productsAPI } from '../utils/api';

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
}

interface ProductListingFormProps {
  onSuccess?: () => void;
}

const ProductListingForm = ({ onSuccess }: ProductListingFormProps) => {
  const [formData, setFormData] = useState<ProductFormData>({
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
  });

  const [specKey, setSpecKey] = useState('');
  const [specValue, setSpecValue] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<{ [key: number]: string }>({});

  // Update preview URLs when images change
  useEffect(() => {
    const previews: { [key: number]: string } = {};
    formData.images.forEach((image, index) => {
      if (image) {
        previews[index] = URL.createObjectURL(image);
      }
    });
    
    setImagePreviews(prevPreviews => {
      // Clean up old previews
      Object.values(prevPreviews).forEach(url => URL.revokeObjectURL(url));
      return previews;
    });
    
    // Cleanup on unmount or when images change
    return () => {
      Object.values(previews).forEach(url => URL.revokeObjectURL(url));
    };
  }, [formData.images.map(img => img?.name + img?.size).join(',')]);

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
    const validImages = formData.images.filter((img) => img !== null);
    if (validImages.length === 0) {
      setError('At least one product image is required');
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
      
      // Add image files
      validImages.forEach((image) => {
        if (image) {
          formDataToSend.append('images', image);
        }
      });

      await productsAPI.create(formDataToSend);
      setSuccess(true);
      
      // Reset form
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
      });

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

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">List a New Product</h2>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
          Product listed successfully! Redirecting...
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
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#2563EB] focus:border-[#2563EB]"
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
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#2563EB] focus:border-[#2563EB]"
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#2563EB] focus:border-[#2563EB]"
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#2563EB] focus:border-[#2563EB]"
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#2563EB] focus:border-[#2563EB]"
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#2563EB] focus:border-[#2563EB]"
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#2563EB] focus:border-[#2563EB]"
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#2563EB] focus:border-[#2563EB]"
              placeholder="0"
            />
          </div>
        </div>

        {/* Product Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Images <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 mb-2">At least one image is required (up to 5 images, max 5MB each)</p>
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
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#2563EB] focus:border-[#2563EB] text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#2563EB] file:text-white hover:file:bg-[#1d4ed8]"
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
              {image && imagePreviews[index] && (
                <div className="mt-2">
                  <img
                    src={imagePreviews[index]}
                    alt={`Preview ${index + 1}`}
                    className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                  />
                  <p className="text-xs text-gray-500 mt-1">{image.name} ({(image.size / 1024 / 1024).toFixed(2)} MB)</p>
                </div>
              )}
            </div>
          ))}
          {formData.images.length < 5 && (
            <button
              type="button"
              onClick={addImageField}
              className="mt-2 text-sm text-[#2563EB] hover:text-[#1d4ed8]"
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
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#2563EB] focus:border-[#2563EB]"
              placeholder="Key (e.g., Color)"
            />
            <input
              type="text"
              value={specValue}
              onChange={(e) => setSpecValue(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#2563EB] focus:border-[#2563EB]"
              placeholder="Value (e.g., Black)"
            />
          </div>
          <button
            type="button"
            onClick={addSpecification}
            className="mb-2 text-sm text-[#2563EB] hover:text-[#1d4ed8]"
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
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#2563EB] focus:border-[#2563EB]"
              placeholder="Enter tag and press Enter"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2 bg-[#2563EB] text-white rounded-md hover:bg-[#1d4ed8]"
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
                images: [''],
                category: '',
                subcategory: '',
                brand: '',
                stock: '',
                specifications: {},
                tags: [],
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
            className="px-6 py-2 bg-[#2563EB] text-white rounded-md hover:bg-[#1d4ed8] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Listing Product...' : 'List Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductListingForm;

