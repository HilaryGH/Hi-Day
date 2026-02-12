import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  rating: {
    average: number;
    count: number;
  };
  stock: number;
  seller: {
    _id: string;
    name: string;
    email: string;
  };
}

const SellerStore = () => {
  const { sellerId } = useParams<{ sellerId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [sellerInfo, setSellerInfo] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    if (sellerId) {
      loadProducts();
    }
  }, [sellerId, pagination.page]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productsAPI.getAll({
        seller: sellerId,
        page: pagination.page,
        limit: pagination.limit,
      });
      
      setProducts(data.products);
      setPagination(data.pagination);
      
      // Extract seller info from first product
      if (data.products.length > 0 && data.products[0].seller) {
        setSellerInfo({
          name: data.products[0].seller.name,
          email: data.products[0].seller.email,
        });
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#16A34A]"></div>
          <p className="mt-4 text-gray-600">Loading store...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: 'rgba(249, 250, 251, 0.7)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Seller Header */}
        {sellerInfo && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{sellerInfo.name}'s Store</h1>
                <p className="text-gray-600">{pagination.total} {pagination.total === 1 ? 'product' : 'products'} available</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Seller</p>
                  <p className="font-semibold text-gray-900">{sellerInfo.name}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <svg className="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-4">This seller hasn't listed any products yet.</p>
              <Link
                to="/products"
                className="inline-block bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                Browse All Products
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden group flex flex-col"
                >
                  <Link to={`/products/${product._id}`} className="flex-1 flex flex-col">
                    <div className="aspect-square bg-gray-100 overflow-hidden">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-[#16A34A] transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl font-bold text-[#16A34A]">
                          ETB {product.price.toLocaleString()}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-sm text-gray-500 line-through">
                            ETB {product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                      {product.rating.count > 0 && (
                        <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                          <span className="text-[#16A34A]">★</span>
                          <span>{product.rating.average.toFixed(1)}</span>
                          <span>({product.rating.count})</span>
                        </div>
                      )}
                      {product.stock === 0 && (
                        <span className="inline-block mt-auto text-sm text-red-600 font-medium mb-2">
                          Out of Stock
                        </span>
                      )}
                    </div>
                  </Link>
                  <div className="p-4 pt-0 space-y-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!user) {
                          navigate('/login');
                          return;
                        }
                        if (product.stock === 0) {
                          alert('This product is out of stock');
                          return;
                        }
                        navigate('/checkout', {
                          state: {
                            product: {
                              _id: product._id,
                              name: product.name,
                              price: product.price,
                              images: product.images,
                              quantity: 1
                            },
                            fromCart: false
                          }
                        });
                      }}
                      disabled={product.stock === 0}
                      className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Shop Now
                    </button>
                    <Link
                      to={`/products/${product._id}`}
                      className="block w-full text-center text-[#16A34A] hover:text-[#15803D] font-medium py-2 px-4 rounded-lg transition-colors border border-[#16A34A] hover:bg-[#16A34A]/5"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SellerStore;


