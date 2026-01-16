import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { productsAPI } from "../utils/api";
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
  product: any | null;
}

const Home: React.FC = () => {
  const [categoryProducts, setCategoryProducts] = useState<CategoryProduct[]>([]);
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        setLoading(true);
        // Fetch first product from each of the first 4 categories
        const popularCategories = categories.slice(0, 4);
        const productPromises = popularCategories.map(async (category) => {
          try {
            const response = await productsAPI.getAll({
              category: category.categoryName,
              limit: 1,
              sortBy: 'createdAt',
              order: 'desc'
            });
            return {
              category: category.name,
              product: response.products && response.products.length > 0 ? response.products[0] : null
            };
          } catch (error) {
            console.error(`Error fetching products for ${category.name}:`, error);
            return {
              category: category.name,
              product: null
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

    fetchCategoryProducts();
    fetchNewArrivals();
  }, []);

  const getProductForCategory = (categoryName: string) => {
    return categoryProducts.find(cp => cp.category === categoryName)?.product || null;
  };

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
            {/* African Shape Mirror */}
            <div className="md:col-span-3 bg-gradient-to-r from-[#93C5FD] to-[#60A5FA] rounded-lg text-white relative overflow-hidden min-h-[140px] md:h-full flex">
              {/* Text content on the left */}
              <div className="w-1/2 p-3 md:p-2.5 relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 mb-1.5 md:mb-1">
                    <span className="bg-[#16A34A] text-white px-2 py-1 md:px-1.5 md:py-0.5 rounded-full text-[10px] md:text-[9px] font-bold">SALE</span>
                    <span className="text-white/90 text-[10px] md:text-[9px]">Limited Time</span>
                  </div>
                  <h2 className="text-base md:text-sm lg:text-base font-bold mb-1 md:mb-0.5">Used African Shape Mirror</h2>
                  <p className="text-white/90 mb-2 md:mb-1.5 text-xs md:text-[10px] lg:text-xs">Beautiful Handcrafted African Design</p>
                </div>
                <Link
                  to="/products"
                  className="inline-block bg-white text-[#3B82F6] font-semibold py-1.5 px-4 md:py-1 md:px-3 rounded-md hover:bg-[#F9FAFB] transition-all transform hover:scale-105 text-xs md:text-[10px] w-fit"
                >
                  Shop Now
                </Link>
              </div>
              {/* Image on the right - half width, 80% height, centered */}
              <div className="w-1/2 h-full flex items-center justify-center overflow-hidden">
                <img 
                  src="/africa mirror.jpg" 
                  alt="African Shape Mirror" 
                  className="w-full h-[80%] object-cover"
                />
              </div>
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
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
                  const product = getProductForCategory(category.categoryName);
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
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-[#111827] mb-4">Shop by Category</h2>
          <p className="text-xl text-[#6B7280] max-w-2xl mx-auto">
            Browse thousands of products across multiple categories
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: "Fashion & Apparel", price: "1000+ Items", desc: "Clothing, shoes & accessories" },
            { name: "Electronics", price: "500+ Items", desc: "Phones, laptops & gadgets" },
            { name: "Home & Living", price: "800+ Items", desc: "Furniture & home decor" },
            { name: "Beauty & Personal Care", price: "600+ Items", desc: "Skincare & cosmetics" }
          ].map((product, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 overflow-hidden group">
              <div className="relative h-64 bg-gradient-to-br from-[#16A34A]/10 to-[#16A34A]/20 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-32 h-32 text-[#16A34A]/30 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                  </svg>
                </div>
                <div className="absolute top-4 right-4 bg-[#16A34A] text-white px-3 py-1 rounded-full text-sm font-semibold">
                  New
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-xl mb-2 text-[#111827]">{product.name}</h3>
                <p className="text-[#6B7280] mb-4 text-sm">{product.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-[#16A34A]">{product.price}</span>
                  <button className="bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced About Section */}
      <div className="max-w-7xl mx-auto py-20 px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl">
              <div className="aspect-square bg-gradient-to-br from-[#16A34A]/10 via-[#16A34A]/20 to-[#16A34A]/30 flex items-center justify-center">
                <svg className="w-64 h-64 text-[#16A34A]/40" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-[#16A34A]/20 rounded-full opacity-50 blur-2xl"></div>
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-[#16A34A]/30 rounded-full opacity-50 blur-2xl"></div>
          </div>
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#111827] mb-6">About da-hi Marketplace</h2>
            <p className="text-lg text-[#111827] mb-4 leading-relaxed">
              da-hi Marketplace is Ethiopia's premier online shopping destination, connecting buyers and sellers 
              across the country. We're building a vibrant community where everyone can buy and sell with confidence.
            </p>
            <p className="text-lg text-[#111827] mb-6 leading-relaxed">
              Our mission is to empower local businesses and provide customers with access to a wide variety of 
              quality products. Whether you're looking to shop or start selling, da-hi Marketplace offers a secure, 
              user-friendly platform for all your needs.
            </p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#16A34A]/10 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#16A34A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="font-semibold text-[#111827]">Quality Assured</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#16A34A]/10 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#16A34A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="font-semibold text-gray-900">Fast Shipping</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#16A34A]/10 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#16A34A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <span className="font-semibold text-gray-900">Secure Payment</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#16A34A]/10 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#16A34A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <span className="font-semibold text-gray-900">24/7 Support</span>
              </div>
            </div>
            <button className="bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold py-3 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg">
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Compact CTA Section */}
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="bg-gradient-to-r from-[#16A34A] to-[#15803D] rounded-lg px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-white text-center sm:text-left">
            <p className="text-sm font-medium mb-1">Ready to Get Started?</p>
            <p className="text-xs text-white/90">Join thousands of buyers and sellers on Ethiopia's fastest-growing marketplace</p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/products"
              className="bg-white text-[#16A34A] hover:bg-[#F9FAFB] font-semibold py-2 px-4 rounded-md transition-colors text-sm whitespace-nowrap"
            >
              Start Shopping
            </Link>
            <Link
              to="/register"
              className="border-2 border-white text-white hover:bg-white hover:text-[#16A34A] font-semibold py-2 px-4 rounded-md transition-colors text-sm whitespace-nowrap"
            >
              Start Selling
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Home;
