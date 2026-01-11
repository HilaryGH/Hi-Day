const Hero = () => {
  return (
    <section id="home" className="relative bg-gradient-to-br from-amber-50 via-white to-amber-50 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Premium Hair & Wigs
              <span className="block text-amber-600 mt-2">From China to Ethiopia</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
              Discover our exquisite collection of high-quality human hair and wigs, 
              carefully imported from China and distributed across Ethiopia. 
              Elevate your style with premium products you can trust.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button className="bg-amber-600 text-white px-8 py-4 rounded-lg hover:bg-amber-700 transition-all transform hover:scale-105 font-semibold text-lg shadow-lg">
                Browse Collection
              </button>
              <button className="bg-white text-amber-600 border-2 border-amber-600 px-8 py-4 rounded-lg hover:bg-amber-50 transition-all transform hover:scale-105 font-semibold text-lg">
                Learn More
              </button>
            </div>
            
            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-6">
              <div>
                <div className="text-3xl font-bold text-amber-600">1000+</div>
                <div className="text-sm text-gray-600 mt-1">Products</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-amber-600">5000+</div>
                <div className="text-sm text-gray-600 mt-1">Happy Customers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-amber-600">100%</div>
                <div className="text-sm text-gray-600 mt-1">Quality Guaranteed</div>
              </div>
            </div>
          </div>

          {/* Right Column - Image/Visual */}
          <div className="relative">
            <div className="relative z-10">
              {/* Placeholder for hero image - you can replace this with an actual image */}
              <div className="bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl p-8 shadow-2xl">
                <div className="aspect-square bg-white rounded-xl flex items-center justify-center">
                  <svg 
                    className="w-full h-full text-amber-300" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                  </svg>
                </div>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-amber-200 rounded-full opacity-50 blur-2xl"></div>
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-amber-300 rounded-full opacity-50 blur-2xl"></div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg 
          className="w-6 h-6 text-amber-600" 
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











