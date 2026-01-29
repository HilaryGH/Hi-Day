import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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
  seller?: {
    _id: string;
    name: string;
    email: string;
  };
}

const Products = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Initialize filters from URL parameters
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    order: searchParams.get('order') || 'desc',
  });
  const [pagination, setPagination] = useState({
    page: Number(searchParams.get('page')) || 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  // Update filters when URL parameters change
  useEffect(() => {
    const category = (searchParams.get('category') || '').trim();
    const search = (searchParams.get('search') || '').trim();
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    const page = Number(searchParams.get('page')) || 1;

    setFilters({
      category,
      search,
      minPrice,
      maxPrice,
      sortBy,
      order,
    });
    setPagination((prev) => ({ ...prev, page }));
  }, [searchParams]);

  useEffect(() => {
    loadProducts();
  }, [filters, pagination.page]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (filters.category) params.category = filters.category.trim();
      if (filters.search) params.search = filters.search.trim();
      if (filters.minPrice) params.minPrice = Number(filters.minPrice);
      if (filters.maxPrice) params.maxPrice = Number(filters.maxPrice);
      if (filters.sortBy) params.sortBy = filters.sortBy;
      if (filters.order) params.order = filters.order;

      const data = await productsAPI.getAll(params);
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
    
    // Update URL parameters
    const newSearchParams = new URLSearchParams();
    if (newFilters.category) newSearchParams.set('category', newFilters.category);
    if (newFilters.search) newSearchParams.set('search', newFilters.search);
    if (newFilters.minPrice) newSearchParams.set('minPrice', newFilters.minPrice);
    if (newFilters.maxPrice) newSearchParams.set('maxPrice', newFilters.maxPrice);
    if (newFilters.sortBy !== 'createdAt') newSearchParams.set('sortBy', newFilters.sortBy);
    if (newFilters.order !== 'desc') newSearchParams.set('order', newFilters.order);
    
    setSearchParams(newSearchParams, { replace: true });
  };

  const categories = [
    'Fashion & Apparel',
    'Electronics',
    'Home & Living',
    'Beauty & Personal Care',
    'Sports & Outdoors',
    'Books',
    'Toys & Games',
    'Food & Beverages',
    'Other',
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shop Products</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Filters</h2>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search products..."
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#16A34A] focus:border-transparent"
                />
              </div>

              {/* Category */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#16A34A]"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    placeholder="Min"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    placeholder="Max"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={`${filters.sortBy}-${filters.order}`}
                  onChange={(e) => {
                    const [sortBy, order] = e.target.value.split('-');
                    handleFilterChange('sortBy', sortBy);
                    handleFilterChange('order', order);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating.average-desc">Highest Rated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#16A34A]"></div>
                <p className="mt-4 text-gray-600">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <svg className="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                  {filters.category ? (
                    <p className="text-gray-600 mb-4">No products available in the "{filters.category}" category.</p>
                  ) : filters.search ? (
                    <p className="text-gray-600 mb-4">No products match your search "{filters.search}".</p>
                  ) : (
                    <p className="text-gray-600 mb-4">Try adjusting your filters or search criteria.</p>
                  )}
                  <button
                    onClick={() => {
                      setFilters({
                        category: '',
                        search: '',
                        minPrice: '',
                        maxPrice: '',
                        sortBy: 'createdAt',
                        order: 'desc',
                      });
                      setSearchParams({}, { replace: true });
                    }}
                    className="bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Group products by seller */}
                {(() => {
                  // Group products by seller
                  const groupedBySeller = products.reduce((acc, product) => {
                    const sellerId = product.seller?._id || 'unknown';
                    const sellerName = product.seller?.name || 'Unknown Seller';
                    
                    if (!acc[sellerId]) {
                      acc[sellerId] = {
                        seller: product.seller || { _id: sellerId, name: sellerName, email: '' },
                        products: []
                      };
                    }
                    acc[sellerId].products.push(product);
                    return acc;
                  }, {} as Record<string, { seller: { _id: string; name: string; email: string }; products: Product[] }>);

                  return Object.values(groupedBySeller).map((sellerGroup, groupIndex) => (
                    <div key={sellerGroup.seller._id || groupIndex} className="mb-8">
                      {/* Seller Header */}
                      <div className="bg-white rounded-lg shadow p-4 mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-[#16A34A]/10 rounded-full flex items-center justify-center">
                            <span className="text-[#16A34A] font-bold text-lg">
                              {sellerGroup.seller.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-gray-900">{sellerGroup.seller.name}</h2>
                            <p className="text-sm text-gray-600">{sellerGroup.products.length} {sellerGroup.products.length === 1 ? 'product' : 'products'}</p>
                          </div>
                        </div>
                        <Link
                          to={`/seller/${sellerGroup.seller._id}`}
                          className="text-[#16A34A] hover:text-[#15803D] font-medium text-sm flex items-center gap-1 transition-colors"
                        >
                          View Store
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>

                      {/* Products Grid for this seller */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                        {sellerGroup.products.map((product) => (
                          <div
                            key={product._id}
                            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden group flex flex-col"
                          >
                            <Link to={`/products/${product._id}`} className="flex-1 flex flex-col">
                              <div className="h-32 bg-gray-100 overflow-hidden">
                                {product.images && product.images.length > 0 ? (
                                  <img
                                    src={product.images[0]}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              <div className="p-2 flex-1 flex flex-col">
                                <h3 className="font-medium text-xs text-gray-900 mb-1 line-clamp-2 hover:text-[#16A34A] transition-colors leading-tight">
                                  {product.name}
                                </h3>
                                <div className="flex items-center gap-1 mb-1 flex-wrap">
                                  <span className="text-sm font-bold text-[#16A34A]">
                                    ETB {product.price.toLocaleString()}
                                  </span>
                                  {product.originalPrice && product.originalPrice > product.price && (
                                    <span className="text-xs text-gray-500 line-through">
                                      ETB {product.originalPrice.toLocaleString()}
                                    </span>
                                  )}
                                </div>
                                {product.rating.count > 0 && (
                                  <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                                    <span className="text-[#16A34A] text-xs">★</span>
                                    <span className="text-xs">{product.rating.average.toFixed(1)}</span>
                                    <span className="text-xs">({product.rating.count})</span>
                                  </div>
                                )}
                                {product.stock === 0 && (
                                  <span className="inline-block mt-auto text-xs text-red-600 font-medium mb-1">
                                    Out of Stock
                                  </span>
                                )}
                              </div>
                            </Link>
                            <div className="p-2 pt-0 space-y-1.5">
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
                                className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white font-medium text-xs py-1.5 px-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Shop Now
                              </button>
                              <Link
                                to={`/products/${product._id}`}
                                className="block w-full text-center text-[#16A34A] hover:text-[#15803D] font-medium text-xs py-1.5 px-2 rounded transition-colors border border-[#16A34A] hover:bg-[#16A34A]/5"
                              >
                                View Details
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ));
                })()}

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
      </div>
    </div>
  );
};

export default Products;

