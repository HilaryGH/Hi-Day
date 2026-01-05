import React from "react";

const Home: React.FC = () => {
  return (
    <section className="w-full">
      {/* Enhanced Hero Section */}
      <div className="relative w-full h-screen flex flex-col md:flex-row overflow-hidden">
        {/* Content Half - Left Side */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full bg-gradient-to-br from-amber-50 via-white to-amber-50 flex items-center justify-center text-center md:text-left px-4 md:px-8 lg:px-12 py-12 md:py-0 order-2 md:order-1 relative overflow-hidden">
          {/* Overlay similar to image section */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"></div>
          <div className="max-w-2xl relative z-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Your Hair, Your Confidence
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Discover our exquisite collection of high-quality human hair and wigs, 
              carefully imported from China and distributed across Ethiopia. 
              Elevate your style with premium products you can trust.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-4 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg text-lg">
                Shop Now
              </button>
              <button className="border-2 border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white font-semibold py-4 px-8 rounded-lg transition-all transform hover:scale-105 text-lg">
                Explore Collection
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-lg border border-amber-100">
                <div className="text-3xl md:text-4xl font-bold text-amber-600 mb-1">1000+</div>
                <div className="text-sm text-gray-600 font-medium">Products</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-lg border border-amber-100">
                <div className="text-3xl md:text-4xl font-bold text-amber-600 mb-1">5000+</div>
                <div className="text-sm text-gray-600 font-medium">Customers</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-lg border border-amber-100">
                <div className="text-3xl md:text-4xl font-bold text-amber-600 mb-1">100%</div>
                <div className="text-sm text-gray-600 font-medium">Quality</div>
              </div>
            </div>
          </div>
        </div>

        {/* Image Half - Right Side */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full relative order-1 md:order-2 overflow-hidden">
          <img 
            src="/hi day.jpg" 
            alt="Hi Day" 
            className="w-full h-full object-cover"
          />
          {/* Optional subtle overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"></div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-10">
          <svg 
            className="w-6 h-6 text-white drop-shadow-lg" 
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
      </div>

      {/* Enhanced Features Section */}
      <div className="max-w-7xl mx-auto py-20 px-4 bg-white">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Why Choose Hi-Day?</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We bring you the finest quality hair products with unmatched service
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center p-8 rounded-2xl bg-gradient-to-br from-amber-50 to-white hover:shadow-xl transition-all transform hover:-translate-y-2">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h3 className="font-bold text-2xl mb-3 text-gray-900">Premium Quality</h3>
            <p className="text-gray-600 text-center leading-relaxed">
              100% human hair, verified and smooth. Every strand is carefully selected for consistency and shine.
            </p>
          </div>
          <div className="flex flex-col items-center p-8 rounded-2xl bg-gradient-to-br from-amber-50 to-white hover:shadow-xl transition-all transform hover:-translate-y-2">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-2xl mb-3 text-gray-900">Verified Hair</h3>
            <p className="text-gray-600 text-center leading-relaxed">
              Carefully sourced from trusted suppliers in China, ensuring authenticity and premium quality.
            </p>
          </div>
          <div className="flex flex-col items-center p-8 rounded-2xl bg-gradient-to-br from-amber-50 to-white hover:shadow-xl transition-all transform hover:-translate-y-2">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-bold text-2xl mb-3 text-gray-900">Fast Delivery</h3>
            <p className="text-gray-600 text-center leading-relaxed">
              Nationwide delivery to all cities in Ethiopia. Fast, secure, and reliable shipping.
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Collections Section */}
      <div className="max-w-7xl mx-auto py-20 px-4 bg-gradient-to-b from-white to-amber-50">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Our Collections</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore our wide range of premium hair products
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: "Brazilian Hair", price: "$69.99", desc: "Silky smooth texture" },
            { name: "Peruvian Hair", price: "$79.99", desc: "Natural wave pattern" },
            { name: "Malaysian Hair", price: "$89.99", desc: "Luxurious shine" },
            { name: "Indian Hair", price: "$74.99", desc: "Thick and voluminous" }
          ].map((product, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 overflow-hidden group">
              <div className="relative h-64 bg-gradient-to-br from-amber-100 to-amber-200 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-32 h-32 text-amber-300 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                  </svg>
                </div>
                <div className="absolute top-4 right-4 bg-amber-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  New
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-xl mb-2 text-gray-900">{product.name}</h3>
                <p className="text-gray-600 mb-4 text-sm">{product.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-amber-600">{product.price}</span>
                  <button className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
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
              <div className="aspect-square bg-gradient-to-br from-amber-100 via-amber-200 to-amber-300 flex items-center justify-center">
                <svg className="w-64 h-64 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-amber-200 rounded-full opacity-50 blur-2xl"></div>
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-amber-300 rounded-full opacity-50 blur-2xl"></div>
          </div>
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">About Hi-Day</h2>
            <p className="text-lg text-gray-700 mb-4 leading-relaxed">
              Hi-Day was born to empower women to feel confident and beautiful every day. 
              We bring premium human hair and professional-grade wigs directly from China to Ethiopia.
            </p>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              Our mission is to provide access to high-quality hair products that enhance your natural beauty 
              and boost your confidence. Every product is carefully selected, verified, and distributed with 
              the highest standards of quality and service.
            </p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="font-semibold text-gray-900">Quality Assured</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="font-semibold text-gray-900">Fast Shipping</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <span className="font-semibold text-gray-900">Secure Payment</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <span className="font-semibold text-gray-900">24/7 Support</span>
              </div>
            </div>
            <button className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg">
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="max-w-7xl mx-auto py-20 px-4 bg-gradient-to-b from-amber-50 to-white">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
          <p className="text-xl text-gray-600">Real reviews from satisfied customers</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { name: "Amina Hassan", location: "Addis Ababa", text: "The quality is amazing! My hair looks so natural and beautiful. Highly recommend!" },
            { name: "Tigist Bekele", location: "Dire Dawa", text: "Fast delivery and excellent customer service. The hair exceeded my expectations." },
            { name: "Meron Tesfaye", location: "Hawassa", text: "Best hair I've ever purchased. The texture is perfect and it lasts so long!" }
          ].map((testimonial, i) => (
            <div key={i} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <svg key={j} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed italic">"{testimonial.text}"</p>
              <div>
                <div className="font-semibold text-gray-900">{testimonial.name}</div>
                <div className="text-sm text-gray-600">{testimonial.location}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced CTA Section */}
      <div className="relative w-full bg-gradient-to-r from-amber-600 to-amber-700 py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Ready to Shine?
          </h2>
          <p className="text-xl md:text-2xl mb-8 text-amber-100">
            Explore our premium hair collections today and transform your look
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-white text-amber-600 hover:bg-amber-50 font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105 shadow-xl text-lg">
              Shop Now
            </button>
            <button className="border-2 border-white text-white hover:bg-white hover:text-amber-600 font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105 text-lg">
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Home;
