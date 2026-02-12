import { Link } from 'react-router-dom';
import SectionBackground from '../components/SectionBackground';

const About = () => {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative" style={{ backgroundColor: 'rgba(249, 250, 251, 0.85)' }}>
      {/* Background Images */}
      <SectionBackground opacity={0.15} imagesPerRow={3} />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-12 text-center">
          <Link to="/" className="inline-block mb-6">
            <img 
              src="/logo2.png" 
              alt="da-hi Logo" 
              className="h-12 w-auto mx-auto"
            />
          </Link>
        </div>

        {/* Main Content - Left Section */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Section - Content */}
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
              About da-hi Marketplace
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-6 font-medium">
              Ethiopia's trusted online shopping destination.
            </p>
            <div className="space-y-4 text-gray-700 leading-relaxed mb-8">
              <p className="text-base md:text-lg">
                We connect verified local sellers with buyers across the country through a secure, easy-to-use marketplace. From everyday essentials to pre-order and imported products, da-hi Marketplace makes buying and selling simple, safe, and reliable.
              </p>
              <p className="text-lg md:text-xl font-semibold text-[#16A34A]">
                Shop with confidence. Sell with ease.
              </p>
            </div>
            <Link
              to="/products"
              className="inline-block bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold py-3 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg text-base md:text-lg"
            >
              Learn More
            </Link>
          </div>

          {/* Right Section - Empty for now, can add image or visual element later */}
          <div className="relative z-10">
            {/* This space can be used for an image or visual element in the future */}
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-12 text-center relative z-10">
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
