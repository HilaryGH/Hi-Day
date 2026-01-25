import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { productsAPI, promotionAPI } from "../utils/api";
import BestSellers from "./BestSellers";
import TopSellers from "./TopSellers";
import RecentProducts from "./RecentProducts";

const categories = [
  { name: "Fashion & Apparel", categoryName: "Fashion & Apparel" },
  { name: "Electronics", categoryName: "Electronics" },
  { name: "Home & Living", categoryName: "Home & Living" },
  { name: "Beauty & Personal Care", categoryName: "Beauty & Personal Care" },
  { name: "Sports & Outdoors", categoryName: "Sports & Outdoors" },
  { name: "Books", categoryName: "Books" },
  { name: "Toys & Games", categoryName: "Toys & Games" },
  { name: "Food & Beverages", categoryName: "Food & Beverages" },
];

interface CategoryProduct {
  category: string;
  categoryName: string;
  products: any[];
  total: number;
}

const Home: React.FC = () => {
  const [categoryProducts, setCategoryProducts] = useState<CategoryProduct[]>([]);
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [promotion, setPromotion] = useState<any>(null);
  const [discountedProduct, setDiscountedProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        setLoading(true);
        // Fetch products from all categories
        const productPromises = categories.map(async (category) => {
          try {
            const response = await productsAPI.getAll({
              category: category.categoryName,
              limit: 4, // Fetch up to 4 products per category
              sortBy: 'createdAt',
              order: 'desc'
            });
            return {
              category: category.name,
              categoryName: category.categoryName,
              products: response.products || [],
              total: response.pagination?.total || 0
            };
          } catch (error) {
            console.error(`Error fetching products for ${category.name}:`, error);
            return {
              category: category.name,
              categoryName: category.categoryName,
              products: [],
              total: 0
            };
          }
        });

        const results = await Promise.all(productPromises);
        setCategoryProducts(results);
      } catch (error) {
        console.error('Error fetching category products:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchNewArrivals = async () => {
      try {
        // Fetch the latest 3 products
        const response = await productsAPI.getAll({
          limit: 3,
          sortBy: 'createdAt',
          order: 'desc'
        });
        if (response.products && response.products.length > 0) {
          setNewArrivals(response.products);
        }
      } catch (error) {
        console.error('Error fetching new arrivals:', error);
      }
    };

    const fetchPromotion = async () => {
      try {
        const response = await promotionAPI.getAll({ active: true, limit: 1 });
        if (response.promotions && response.promotions.length > 0) {
          const fetchedPromotion = response.promotions[0];
          setPromotion(fetchedPromotion);
          
          // If promotion has products, fetch the first one
          if (fetchedPromotion.products && fetchedPromotion.products.length > 0) {
            try {
              const productId = fetchedPromotion.products[0]._id || fetchedPromotion.products[0];
              const productResponse = await productsAPI.getOne(productId);
              if (productResponse) {
                setDiscountedProduct(productResponse);
                return; // Exit early if we got a product from promotion
              }
            } catch (error) {
              console.error('Error fetching discounted product from promotion:', error);
            }
          }
          
          // If no product from promotion, fetch any discounted product
          try {
            const productsResponse = await productsAPI.getAll({ limit: 20 });
            if (productsResponse.products && productsResponse.products.length > 0) {
              // Find a product that is on sale or has a promotion
              const onSaleProduct = productsResponse.products.find(
                (p: any) => p.onSale === true || p.promotion || (p.originalPrice && p.price < p.originalPrice)
              );
              if (onSaleProduct) {
                setDiscountedProduct(onSaleProduct);
              }
            }
          } catch (error) {
            console.error('Error fetching discounted product:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching promotion:', error);
      }
    };

    fetchCategoryProducts();
    fetchNewArrivals();
    fetchPromotion();
  }, []);


  return (
    <section className="w-full">
      {/* Enhanced Hero Section */}
      <div className="relative w-full min-h-[45vh] md:min-h-[50vh] lg:min-h-[55vh] flex flex-col lg:flex-row overflow-hidden bg-[#F9FAFB]">
        {/* Left Side - Categories (Hidden on mobile, shown on desktop) */}
        <div className="hidden lg:block lg:w-64 xl:w-72 bg-white border-r border-[#E5E7EB] p-4 lg:min-h-[50vh] xl:min-h-[55vh]">
          <h2 className="text-xl font-bold text-[#111827] mb-4 flex items-center gap-2">
          
            Categories
          </h2>
          <ul className="space-y-2">
            {categories.map((category, index) => (
              <li key={index}>
                <Link
                  to={`/products?category=${encodeURIComponent(category.categoryName)}`}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#F9FAFB] transition-colors group"
                >
                  <span className="text-[#111827] font-medium group-hover:text-[#16A34A] transition-colors">
                    {category.name}
                  </span>
                  <svg 
                    className="w-5 h-5 text-[#6B7280] ml-auto group-hover:text-[#16A34A] group-hover:translate-x-1 transition-all" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Side - Hero Content */}
        <div className="flex-1 px-4 md:px-8 lg:px-12 py-4 md:py-8 lg:py-6">
          {/* Top Section - Mega Sale Event on Left, Two Cards Stacked on Right */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-8 lg:gap-12 min-h-[140px] md:h-[7vh] w-full">
            {/* Promotional Section - Creative Banner with Wave Overlay */}
            <div className="md:col-span-3 rounded-lg relative overflow-hidden min-h-[140px] md:h-full group">
              {/* Background Image or Gradient Fallback */}
              {(discountedProduct?.images?.[0] || promotion?.image) ? (
                <div className="absolute inset-0">
                  <img 
                    src={discountedProduct?.images?.[0] || promotion?.image} 
                    alt={discountedProduct?.name || promotion?.name || 'Promotional Image'} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    key={discountedProduct?.images?.[0] || promotion?.image}
                  />
                  {/* Dark overlay for better text readability */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
                </div>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#16A34A] via-[#15803D] to-[#16A34A]"></div>
              )}
              
              {/* Wave SVG Overlay - Brand Colors with Creative Design */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                <svg 
                  className="absolute bottom-0 left-0 w-full" 
                  viewBox="0 0 1440 320" 
                  preserveAspectRatio="none"
                  style={{ height: '70%', minHeight: '200px' }}
                >
                  {/* Main Wave */}
                  <path 
                    d="M0,192L48,197.3C96,203,192,213,288,213.3C384,213,480,203,576,186.7C672,171,768,149,864,154.7C960,160,1056,192,1152,197.3C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" 
                    fill="url(#waveGradient1)"
                    className="opacity-95"
                  />
                  {/* Secondary Wave for Depth */}
                  <path 
                    d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,208C672,213,768,203,864,197.3C960,192,1056,192,1152,186.7C1248,181,1344,171,1392,165.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" 
                    fill="url(#waveGradient2)"
                    className="opacity-80"
                  />
                  <defs>
                    <linearGradient id="waveGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#16A34A" stopOpacity="0.95" />
                      <stop offset="50%" stopColor="#15803D" stopOpacity="0.92" />
                      <stop offset="100%" stopColor="#16A34A" stopOpacity="0.88" />
                    </linearGradient>
                    <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#15803D" stopOpacity="0.85" />
                      <stop offset="50%" stopColor="#16A34A" stopOpacity="0.80" />
                      <stop offset="100%" stopColor="#15803D" stopOpacity="0.75" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Content Overlay - Left Aligned */}
              <div className="relative z-10 h-full flex flex-col justify-between p-4 md:p-6 lg:p-8">
                {/* Shop Now Button - Top Right */}
                <Link
                  to="/products"
                  className="absolute top-3 right-3 md:top-4 md:right-4 z-20 bg-white text-[#16A34A] font-semibold py-1.5 px-3 md:py-2 md:px-4 rounded-lg hover:bg-[#16A34A] hover:text-white transition-all transform hover:scale-105 text-xs md:text-sm shadow-lg"
                >
                  Shop Now
                </Link>

                {/* Main Content */}
                <div className="flex-1 flex flex-col justify-center max-w-md">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs md:text-sm font-bold border border-white/30">
                      {promotion?.bannerText || 'SALE'}
                    </span>
                    <span className="text-white/90 text-xs md:text-sm font-medium">Limited Time</span>
                  </div>
                  
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2 md:mb-3 leading-tight drop-shadow-lg">
                    {promotion?.name || 'Used African Shape Mirror'}
                  </h2>
                  
                  <p className="text-white/90 mb-3 md:mb-4 text-sm md:text-base leading-relaxed drop-shadow-md">
                    {promotion?.description || 'Beautiful Handcrafted African Design'}
                  </p>
                  
                  {promotion && promotion.discountValue && (
                    <div className="mb-4">
                      <span className="inline-block bg-white text-[#16A34A] px-4 py-2 rounded-lg text-sm md:text-base font-bold shadow-lg">
                        {promotion.discountType === 'percentage' 
                          ? `${promotion.discountValue}% OFF`
                          : `Save ${promotion.discountValue} ETB`}
                      </span>
                    </div>
                  )}

                  {/* CTA Button */}
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-2 bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold py-2.5 px-6 md:py-3 md:px-8 rounded-lg transition-all transform hover:scale-105 shadow-xl w-fit mt-2"
                  >
                    <span className="text-sm md:text-base">Explore Now</span>
                    <svg 
                      className="w-4 h-4 md:w-5 md:h-5" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 md:w-40 md:h-40 bg-[#16A34A]/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 md:w-32 md:h-32 bg-[#15803D]/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl"></div>
              </div>
            </div>

            {/* Right Side - Two Cards Side by Side on Mobile, Stacked on Desktop */}
            <div className="md:col-span-2 flex flex-row md:flex-col gap-3 md:gap-2.5 md:h-full">
              {/* Get up to 20% OFF */}
              <div className="flex-1 bg-gradient-to-br from-[#16A34A] to-[#15803D] rounded-lg p-3 md:p-2 text-white relative overflow-hidden min-h-[100px] md:flex-1">
                <div className="absolute top-0 right-0 w-12 h-12 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs md:text-xs font-bold mb-1 md:mb-0.5">Get up to</h3>
                    <div className="text-xl md:text-xl font-bold mb-1 md:mb-0.5">20% OFF</div>
                    <p className="text-white/90 mb-2 md:mb-0.5 text-[10px] md:text-[9px]">On your first purchase</p>
                  </div>
                  <Link
                    to="/products"
                    className="inline-block bg-white text-[#16A34A] font-semibold py-1 px-2 md:py-0.5 md:px-2 rounded-md hover:bg-[#F9FAFB] transition-all text-[10px] md:text-[9px] w-fit"
                  >
                    Claim Offer
                  </Link>
                </div>
              </div>

              {/* New Arrivals */}
              <Link 
                to="/products?sortBy=createdAt&order=desc"
                className="flex-1 bg-white rounded-lg border border-[#E5E7EB] relative overflow-hidden group min-h-[100px] md:flex-1 hover:border-[#16A34A] transition-all md:flex"
              >
                {/* Background Image - Full width/height on mobile, half width on desktop */}
                <div className="absolute inset-0 md:relative md:w-1/2 md:inset-auto h-full flex items-center justify-center overflow-hidden bg-[#F9FAFB]">
                  {newArrivals.length > 0 && newArrivals[0]?.images && newArrivals[0].images.length > 0 ? (
                    <img 
                      src={newArrivals[0].images[0]} 
                      alt={newArrivals[0].name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-10 h-10 md:w-8 md:h-8 text-[#16A34A]/30 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                  )}
                </div>
                
                {/* Mobile View - Overlaid Content */}
                <div className="absolute inset-0 md:hidden flex flex-col justify-between z-10">
                  {/* "New Arrivals" text in top right with orange blur background - no gap from top */}
                  <div className="flex justify-end pt-0 pr-3">
                    <div className="bg-[#16A34A]/90 backdrop-blur-md px-3 py-1.5 rounded-lg">
                      <h3 className="text-xs font-bold text-white">New Arrivals</h3>
                    </div>
                  </div>
                  
                  {/* Shop Now button at bottom - very small gap from bottom */}
                  <div className="flex justify-start pl-3 pb-1">
                    <div className="bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold py-2 px-4 rounded-md transition-colors text-[10px] w-fit">
                      Shop Now
                    </div>
                  </div>
                </div>
                
                {/* Desktop View - Side-by-side content */}
                <div className="hidden md:flex md:w-1/2 p-2 flex flex-col justify-between h-full">
                  <div>
                    <h3 className="text-[10px] font-bold text-[#111827] mb-0.5">New Arrivals</h3>
                    <p className="text-[9px] text-[#6B7280] mb-1">Discover the latest products</p>
                    {newArrivals.length > 0 && newArrivals[0] && (
                      <p className="text-[8px] font-medium text-[#111827] line-clamp-2 mb-1">
                        {newArrivals[0].name}
                      </p>
                    )}
                    {newArrivals.length > 1 && (
                      <p className="text-[8px] text-[#6B7280]">+{newArrivals.length - 1} more</p>
                    )}
                  </div>
                  <div className="inline-block bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold py-1 px-2.5 rounded-md transition-colors text-[9px] w-full text-center">
                    Shop Now
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Explore Popular Categories - Bottom of Hero Section */}
          <div className="mt-4 md:mt-[calc(29vh+1.5rem)] lg:mt-[calc(29vh+2rem)] w-full">
            <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-[#111827] mb-2">Explore Popular Categories</h3>
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full">
                {categories.slice(0, 4).map((_, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg p-1.5 border border-[#E5E7EB] animate-pulse"
                  >
                    <div className="aspect-[4/3] bg-gray-200 rounded-lg mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full">
                {categories.slice(0, 4).map((category, index) => {
                  const categoryData = categoryProducts.find(cp => cp.category === category.name);
                  const product = categoryData?.products?.[0] || null;
                  return (
                    <Link
                      key={index}
                      to={`/products?category=${encodeURIComponent(category.categoryName)}`}
                      className="bg-white rounded-lg p-1.5 border border-[#E5E7EB] hover:border-[#16A34A] hover:shadow-sm transition-all group"
                    >
                      <div className="aspect-[4/3] bg-[#F9FAFB] rounded-lg mb-1 overflow-hidden group-hover:bg-[#16A34A]/5 transition-colors relative">
                        {product && product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name || category.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-[#16A34A]/40 group-hover:text-[#16A34A] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <h4 className="text-[9px] font-medium text-[#111827] group-hover:text-[#16A34A] transition-colors text-center line-clamp-2">
                        {category.name}
                      </h4>
                      {product && (
                        <p className="text-[8px] text-gray-500 text-center mt-0.5 line-clamp-1">
                          {product.name}
                        </p>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Best Sellers Section */}
      <BestSellers />

      {/* Top Sellers Section */}
      <TopSellers />

      {/* Recent Products Section */}
      <RecentProducts />

      {/* Enhanced Categories Section */}
      <div className="max-w-7xl mx-auto py-20 px-4 bg-[#F9FAFB]">
        <div className="mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-[#111827] mb-4">Shop by Category</h2>
          <p className="text-xl text-[#6B7280] max-w-2xl">
            Browse thousands of products across multiple categories
          </p>
        </div>
        <div className="space-y-6">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="h-48 bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            categoryProducts.map((categoryData, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-2xl md:text-3xl text-[#111827] mb-2">{categoryData.category}</h3>
                      <p className="text-[#6B7280] text-sm md:text-base">
                        {categoryData.total > 0 ? `${categoryData.total}+ Items Available` : 'No items available'}
                      </p>
                    </div>
                    <Link
                      to={`/products?category=${encodeURIComponent(categoryData.categoryName)}`}
                      className="bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold py-2 px-6 rounded-lg transition-colors whitespace-nowrap"
                    >
                      View All
                    </Link>
                  </div>
                  {categoryData.products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {categoryData.products.map((product, j) => (
                        <Link
                          key={j}
                          to={`/products/${product._id}`}
                          className="group bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-all"
                        >
                          <div className="relative h-48 bg-gray-100 overflow-hidden">
                            {product.images && product.images.length > 0 ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                            {product.onSale && (
                              <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                                SALE
                              </div>
                            )}
                          </div>
                          <div className="p-3">
                            <h4 className="font-semibold text-sm text-[#111827] mb-1 line-clamp-2 group-hover:text-[#16A34A] transition-colors">
                              {product.name}
                            </h4>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-[#16A34A]">
                                ETB {product.price?.toLocaleString() || '0'}
                              </span>
                              {product.originalPrice && product.originalPrice > product.price && (
                                <span className="text-sm text-gray-500 line-through">
                                  ETB {product.originalPrice.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No products available in this category yet.</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Short About Section */}
      <div className="max-w-7xl mx-auto py-12 px-4 bg-[#F9FAFB]">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-[#111827] mb-4">About da-hi Marketplace</h2>
          <p className="text-base md:text-lg text-[#6B7280] mb-6 leading-relaxed">
            Ethiopia's premier online shopping destination, connecting buyers and sellers across the country. 
            We're building a vibrant community where everyone can buy and sell with confidence.
          </p>
          <Link
            to="/about"
            className="inline-flex items-center gap-2 bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold py-3 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg"
          >
            <span>Learn More</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Home;
