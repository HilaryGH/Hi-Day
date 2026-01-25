import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link to="/" className="inline-block mb-6">
            <img 
              src="/logo2.png" 
              alt="da-hi Logo" 
              className="h-12 w-auto mx-auto"
            />
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">About da-hi Marketplace</h1>
          <p className="text-lg text-gray-600">
            Ethiopia's premier online shopping destination
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Who We Are</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              da-hi Marketplace is Ethiopia's premier online shopping destination, connecting buyers and sellers 
              across the country. We're building a vibrant community where everyone can buy and sell with confidence.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Our mission is to empower local businesses and provide customers with access to a wide variety of 
              quality products. Whether you're looking to shop or start selling, da-hi Marketplace offers a secure, 
              user-friendly platform for all your needs.
            </p>
          </section>

          {/* Mission */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-700 leading-relaxed">
              To create a trusted and accessible online marketplace that bridges the gap between buyers and sellers 
              in Ethiopia. We aim to foster economic growth by enabling local businesses to reach a wider audience 
              while providing customers with convenient access to quality products at competitive prices.
            </p>
          </section>

          {/* Features */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Why Choose Us</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#16A34A]/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-[#16A34A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Quality Assured</h3>
                  <p className="text-gray-700 text-sm">
                    All products go through a verification process to ensure quality and authenticity.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#16A34A]/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-[#16A34A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Fast Shipping</h3>
                  <p className="text-gray-700 text-sm">
                    Nationwide delivery to all cities in Ethiopia with reliable and timely shipping.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#16A34A]/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-[#16A34A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Secure Payment</h3>
                  <p className="text-gray-700 text-sm">
                    Safe and secure payment processing with buyer protection for all transactions.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#16A34A]/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-[#16A34A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">24/7 Support</h3>
                  <p className="text-gray-700 text-sm">
                    Round-the-clock customer support to assist you with any questions or concerns.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Values */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Values</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-[#16A34A] font-bold mt-1">•</span>
                <span><strong>Trust:</strong> We build trust through transparency, verified sellers, and secure transactions.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#16A34A] font-bold mt-1">•</span>
                <span><strong>Community:</strong> We foster a vibrant marketplace community where everyone can thrive.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#16A34A] font-bold mt-1">•</span>
                <span><strong>Innovation:</strong> We continuously improve our platform to provide the best user experience.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#16A34A] font-bold mt-1">•</span>
                <span><strong>Accessibility:</strong> We make online shopping accessible to everyone across Ethiopia.</span>
              </li>
            </ul>
          </section>

          {/* CTA */}
          <section className="pt-6 border-t border-gray-200">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Join Our Marketplace</h2>
              <p className="text-gray-700 mb-6">
                Whether you're a buyer looking for quality products or a seller ready to expand your business, 
                da-hi Marketplace is here to help you succeed.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/products"
                  className="inline-block bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold py-3 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg"
                >
                  Start Shopping
                </Link>
                <Link
                  to="/register"
                  className="inline-block bg-white border-2 border-[#16A34A] text-[#16A34A] hover:bg-[#16A34A] hover:text-white font-semibold py-3 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg"
                >
                  Become a Seller
                </Link>
              </div>
            </div>
          </section>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[#16A34A] hover:text-[#15803D] font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;






