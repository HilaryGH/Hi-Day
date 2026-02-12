import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productsAPI, cartAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  stock: number;
  rating: {
    average: number;
    count: number;
  };
  seller: {
    _id?: string;
    name: string;
    email: string;
  };
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    if (id) {
      loadProduct();
    } else {
      setError('Product ID is missing');
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadProduct = async () => {
    if (!id) {
      setError('Product ID is missing');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await productsAPI.getOne(id);
      
      if (data && data._id) {
        // Ensure product has required fields
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
      const errorMessage = err?.response?.data?.message || err?.data?.message || err?.message || 'Failed to load product. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!product) {
      return;
    }

    try {
      setAddingToCart(true);
      await cartAPI.add(product._id, quantity);
      alert('Product added to cart!');
    } catch (error: any) {
      alert(error.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#16A34A]"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || (!loading && !product)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <svg className="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
            <p className="text-gray-600 mb-6">{error || 'The product you are looking for does not exist or has been removed.'}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/products')}
                className="bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                Browse Products
              </button>
              <button
                onClick={() => navigate(-1)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // At this point, product is guaranteed to be non-null after the early return above
  const productData = product!;

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: 'rgba(249, 250, 251, 0.7)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-8">
            {/* Images */}
            <div>
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                {productData.images && productData.images.length > 0 ? (
                  <img
                    src={productData.images[selectedImage]}
                    alt={productData.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              {productData.images && productData.images.length > 1 && (
                <div className="flex gap-2">
                  {productData.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        selectedImage === index ? 'border-[#16A34A]' : 'border-[#E5E7EB]'
                      }`}
                    >
                      <img src={img} alt={`${productData.name} ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{productData.name}</h1>
              
              {productData.rating && productData.rating.count > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-xl ${
                          i < Math.round(productData.rating.average)
                            ? 'text-[#16A34A]'
                            : 'text-gray-300'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-gray-600">
                    {productData.rating.average.toFixed(1)} ({productData.rating.count} reviews)
                  </span>
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-4xl font-bold text-[#16A34A]">
                    ETB {productData.price.toLocaleString()}
                  </span>
                  {productData.originalPrice && productData.originalPrice > productData.price && (
                    <>
                      <span className="text-xl text-gray-500 line-through">
                        ETB {productData.originalPrice.toLocaleString()}
                      </span>
                      <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-semibold">
                        {Math.round(((productData.originalPrice - productData.price) / productData.originalPrice) * 100)}% OFF
                      </span>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  Category: <span className="font-medium">{productData.category}</span>
                </p>
                {productData.seller && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm text-gray-600">
                      Seller: <span className="font-medium">{productData.seller.name || 'Unknown'}</span>
                    </p>
                    {productData.seller._id && (
                      <Link
                        to={`/seller/${productData.seller._id}`}
                        className="text-[#16A34A] hover:text-[#15803D] text-sm font-medium transition-colors flex items-center gap-1"
                      >
                        View Store
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    )}
                  </div>
                )}
              </div>

              <div className="mb-6">
                <p className="text-gray-700 leading-relaxed">{productData.description}</p>
              </div>

              {productData.stock > 0 ? (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border rounded-lg">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="px-4 py-2 hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="px-6 py-2 border-x">{quantity}</span>
                      <button
                        onClick={() => setQuantity((q) => Math.min(productData.stock, q + 1))}
                        className="px-4 py-2 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-sm text-gray-600">
                      {productData.stock} available
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <span className="inline-block px-4 py-2 bg-red-100 text-red-600 rounded-lg font-semibold">
                    Out of Stock
                  </span>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={productData.stock === 0 || addingToCart}
                  className="flex-1 bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingToCart ? 'Adding...' : 'Add to Cart'}
                </button>
                <button
                  onClick={() => {
                    if (!user) {
                      navigate('/login');
                      return;
                    }
                    navigate('/checkout', {
                      state: {
                        product: {
                          _id: productData._id,
                          name: productData.name,
                          price: productData.price,
                          images: productData.images,
                          quantity: quantity
                        },
                        fromCart: false
                      }
                    });
                  }}
                  disabled={productData.stock === 0}
                  className="px-6 py-3 bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Shop Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

