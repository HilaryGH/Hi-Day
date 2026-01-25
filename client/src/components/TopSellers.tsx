import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sellersAPI } from '../utils/api';

const TopSellers: React.FC = () => {
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchTopSellers = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await sellersAPI.getTopSellers(8);
        console.log('Top sellers response:', response); // Debug log
        setSellers(response.sellers || []);
      } catch (error: any) {
        console.error('Error fetching top sellers:', error);
        setError(error.message || 'Failed to load top sellers');
        setSellers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopSellers();
  }, []);

  // Show error if there's an error
  if (error) {
    console.warn('TopSellers error:', error);
  }

  // Always render the section - show loading, error, sellers, or empty state

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
    <section className="w-full bg-white py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Logo Display Above Section */}
        {!loading && sellers.length > 0 && sellers[0]?.avatar && (
          <div className="flex justify-center mb-8">
            <div className="relative">
              <img
                src={sellers[0].avatar}
                alt={getDisplayName(sellers[0])}
                className="w-24 h-24 md:w-32 md:h-32 object-contain rounded-lg shadow-lg border-2 border-[#16A34A]/20"
              />
              {sellers[0].isVerified && (
                <div className="absolute -bottom-2 -right-2 bg-[#16A34A] text-white p-1.5 rounded-full shadow-lg">
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-12 flex items-center justify-between">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
            Top Sellers
          </h2>
          {!loading && sellers.length > 0 && (
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold py-2 px-4 md:py-2.5 md:px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg text-sm md:text-base"
            >
              <span>View All Sellers</span>
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

        {/* Error Message */}
        {error && (
          <div className="text-center py-8">
            <p className="text-red-600 text-sm">Error: {error}</p>
            <p className="text-gray-500 text-xs mt-2">Please try refreshing the page.</p>
          </div>
        )}

        {/* Sellers Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div
                key={item}
                className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-visible animate-pulse"
              >
                <div className="h-48 bg-gray-200 rounded-t-2xl"></div>
                <div className="p-3 space-y-2 -mt-24 bg-white rounded-b-2xl pt-20">
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : sellers.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {sellers.map((seller) => (
              <Link
                key={seller._id}
                to={`/products?seller=${seller._id}`}
                className="group bg-white rounded-2xl border border-gray-200 hover:border-[#16A34A] shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-visible"
              >
                {/* Logo/Avatar Container - Reduced height */}
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 rounded-t-2xl">
                  {seller.avatar ? (
                    <img
                      src={seller.avatar}
                      alt={getDisplayName(seller)}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-24 h-24 bg-gradient-to-br from-[#16A34A] to-[#15803D] rounded-full flex items-center justify-center">
                        <span className="text-3xl font-bold text-white">
                          {getDisplayName(seller).charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Verified Badge */}
                  {seller.isVerified && (
                    <div className="absolute top-2 right-2">
                      <div className="bg-[#16A34A] text-white p-1 rounded-full shadow-lg">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>

                {/* Seller Info - Overlapping the image (half height) */}
                <div className="relative -mt-24 bg-white rounded-2xl rounded-t-none p-3 md:p-4 pt-20 shadow-lg border-t border-gray-100 z-10">
                  <h3 className="font-bold text-sm md:text-base mb-1.5 text-gray-900 line-clamp-2 group-hover:text-[#16A34A] transition-colors">
                    {getDisplayName(seller)}
                  </h3>
                  
                  {/* Location */}
                  <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-2">
                    <svg className="w-3 h-3 text-[#16A34A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="line-clamp-1">{getLocation(seller)}</span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-3 text-[10px] text-gray-500 mb-2">
                    {seller.productCount > 0 && (
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <span>{seller.productCount} Products</span>
                      </div>
                    )}
                    {seller.avgRating > 0 && (
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span>{seller.avgRating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  {/* View Shop Button */}
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <span className="text-xs font-semibold text-[#16A34A] group-hover:text-[#15803D] transition-colors">
                      View Shop →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>No top sellers available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default TopSellers;

