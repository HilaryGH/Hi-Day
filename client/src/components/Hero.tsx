import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { promotionAPI } from '../utils/api';

const Hero = () => {
  const [promotion, setPromotion] = useState<any>(null);

  useEffect(() => {
    const fetchPromotion = async () => {
      try {
        const response = await promotionAPI.getAll({ active: true, limit: 1 });
        if (response.promotions && response.promotions.length > 0) {
          setPromotion(response.promotions[0]);
        }
      } catch (error) {
        console.error('Error fetching promotion:', error);
      }
    };

    fetchPromotion();
  }, []);

  return (
    <section id="home" className="relative bg-gradient-to-br from-green-50 via-white to-green-50 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-green-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="text-center md:text-left">
            {/* Promotion Banner */}
            <div className="mb-4">
              <div className="inline-block bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold mb-2 animate-pulse">
                {promotion?.bannerText || 'SALE'}
              </div>
              <div className="text-sm text-orange-600 font-semibold">
                Limited Time
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight">
              {promotion?.name || 'Used African Shape Mirror'}
            </h1>
            
            <p className="text-xl md:text-2xl lg:text-3xl text-[#16A34A] font-semibold mb-6 leading-relaxed">
              {promotion?.description || 'Beautiful Handcrafted African Design'}
            </p>
            
            {/* Discount Badge */}
            {promotion && promotion.discountValue && (
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-lg shadow-lg">
                  <span className="text-2xl font-bold">
                    {promotion.discountType === 'percentage' 
                      ? `${promotion.discountValue}% OFF`
                      : `Save ${promotion.discountValue} ETB`}
                  </span>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link 
                to="/products"
                className="bg-[#16A34A] text-white px-8 py-4 rounded-lg hover:bg-[#15803D] transition-all transform hover:scale-105 font-semibold text-lg shadow-lg text-center"
              >
                Shop Now
              </Link>
            </div>
            
            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-6">
              <div>
                <div className="text-3xl font-bold text-[#16A34A]">1000+</div>
                <div className="text-sm text-gray-600 mt-1">Products</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#16A34A]">5000+</div>
                <div className="text-sm text-gray-600 mt-1">Happy Customers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#16A34A]">100%</div>
                <div className="text-sm text-gray-600 mt-1">Quality Guaranteed</div>
              </div>
            </div>
          </div>

          {/* Right Column - Image/Visual */}
          <div className="relative">
            <div className="relative z-10">
              <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-2xl p-4 shadow-2xl overflow-hidden">
                <img 
                  src={promotion?.image || '/africa mirror.jpg'} 
                  alt={promotion?.name || 'African Shape Mirror'}
                  className="w-full h-full object-cover rounded-xl aspect-square"
                />
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-green-200 rounded-full opacity-50 blur-2xl"></div>
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-green-300 rounded-full opacity-50 blur-2xl"></div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg 
          className="w-6 h-6 text-[#16A34A]" 
          fill="none" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="2" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
        </svg>
      </div>
    </section>
  );
};

export default Hero;











