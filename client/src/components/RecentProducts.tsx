import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../utils/api';

const RecentProducts: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentProducts = async () => {
      try {
        setLoading(true);
        const response = await productsAPI.getAll({
          limit: 8,
          sortBy: 'createdAt',
          order: 'desc'
        });
        setProducts(response.products || []);
      } catch (error) {
        console.error('Error fetching recent products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentProducts();
  }, []);

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
    <section className="w-full bg-gradient-to-br from-gray-50 via-white to-gray-50 py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 flex items-center justify-between">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
            Recent Products
          </h2>
          {!loading && products.length > 0 && (
            <Link
              to="/products?sortBy=createdAt&order=desc"
              className="inline-flex items-center gap-2 bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold py-2 px-4 md:py-2.5 md:px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg text-sm md:text-base"
            >
              <span>View All Recent Products</span>
              <svg 
                className="w-4 h-4 md:w-5 md:h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13 7l5 5m0 0l-5 5m5-5H6" 
                />
              </svg>
            </Link>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div
                key={item}
                className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse flex flex-row md:flex-col"
              >
                <div className="w-2/5 md:w-full h-32 md:h-64 bg-gray-200"></div>
                <div className="w-3/5 md:w-full relative md:-mt-12 p-2 md:p-3 md:pt-14 space-y-2">
                  <div className="h-2.5 md:h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-2 md:h-2.5 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 md:h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {products.map((product) => {
              const discount = getDiscountPercentage(product);
              return (
                <Link
                  key={product._id}
                  to={`/products/${product._id}`}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden md:overflow-visible flex flex-row md:flex-col"
                >
                  {/* Image Container - Left side on mobile, full width on desktop */}
                  <div className="relative w-2/5 md:w-full h-32 md:h-64 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 rounded-l-2xl md:rounded-t-2xl md:rounded-l-none flex-shrink-0">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg 
                          className="w-12 h-12 md:w-16 md:h-16 text-gray-300" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                          />
                        </svg>
                      </div>
                    )}
                    
                    {/* New Badge */}
                    <div className="absolute top-1.5 left-1.5 md:top-2 md:left-2">
                      <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-1.5 py-0.5 md:px-2 md:py-0.5 rounded-full text-[9px] md:text-[10px] font-bold shadow-lg flex items-center gap-0.5 md:gap-1">
                        <svg className="w-2 h-2 md:w-2.5 md:h-2.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span className="hidden md:inline">New</span>
                      </span>
                    </div>

                    {/* Discount Badge */}
                    {discount && (
                      <div className="absolute top-1.5 right-1.5 md:top-2 md:right-2">
                        <span className="bg-red-500 text-white px-1.5 py-0.5 md:px-2 md:py-0.5 rounded-full text-[9px] md:text-[10px] font-bold shadow-lg">
                          -{discount}%
                        </span>
                      </div>
                    )}

                    {/* Hover Overlay - Desktop only */}
                    <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-3 left-3 right-3">
                        <button className="w-full bg-white text-[#16A34A] font-semibold py-1.5 px-3 rounded-lg hover:bg-[#16A34A] hover:text-white transition-colors transform translate-y-2 group-hover:translate-y-0 duration-300 text-xs">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Product Info - Right side on mobile, overlaying on desktop */}
                  <div className="relative w-3/5 md:w-full md:-mt-12 bg-white rounded-r-2xl md:rounded-2xl md:rounded-t-none p-2 md:p-3 md:pt-14 shadow-lg md:border-t border-gray-100 z-10 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-[10px] md:text-xs lg:text-sm mb-0.5 md:mb-1 text-gray-900 line-clamp-2 group-hover:text-[#16A34A] transition-colors">
                        {product.name}
                      </h3>
                      
                      {/* Category */}
                      {product.category && (
                        <p className="text-[8px] md:text-[9px] text-gray-500 mb-1 md:mb-1.5 uppercase tracking-wide">
                          {product.category}
                        </p>
                      )}

                      {/* Rating */}
                      {product.rating && product.rating.average > 0 && (
                        <div className="flex items-center gap-0.5 md:gap-1 mb-1 md:mb-1.5">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-2 h-2 md:w-2.5 md:h-2.5 ${
                                  i < Math.round(product.rating.average)
                                    ? 'text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-[9px] md:text-[10px] text-gray-600">
                            ({product.rating.count || 0})
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      {/* Price */}
                      <div className="flex items-center gap-1 md:gap-1.5 mb-1 md:mb-0">
                        <span className="text-xs md:text-sm lg:text-base font-bold text-[#16A34A]">
                          {formatPrice(product.price)}
                        </span>
                        {product.onSale && product.originalPrice && product.price < product.originalPrice && (
                          <span className="text-[9px] md:text-[10px] text-gray-500 line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                      </div>

                      {/* Stock Status */}
                      {product.stock > 0 ? (
                        <div className="flex items-center gap-0.5 md:gap-1 text-[9px] md:text-[10px] text-green-600">
                          <svg className="w-2.5 h-2.5 md:w-3 md:h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>In Stock</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-0.5 md:gap-1 text-[9px] md:text-[10px] text-red-600">
                          <svg className="w-2.5 h-2.5 md:w-3 md:h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          <span>Out of Stock</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>No recent products available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default RecentProducts;

