import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white shadow-md border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20 gap-4">
            {/* Left - Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img 
                src="/logo da-hi.png" 
                alt="da-hi Logo" 
                className="h-20 md:h-32 lg:h-36 w-auto"
              />
            </Link>

            {/* Desktop - Center Search Input (hidden on mobile) */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-4">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products..."
                  className="w-full px-4 py-2.5 pl-10 pr-12 border border-[#E5E7EB] rounded-full focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] outline-none"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#2563EB] hover:bg-[#1d4ed8] text-white px-4 py-1.5 rounded-full transition-colors text-sm font-medium"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Right Section - Auth (mobile shows only sign in, desktop shows all) */}
            <div className="flex-shrink-0 flex items-center gap-2 md:gap-4">
              {/* Desktop - All buttons (hidden on mobile) */}
              <div className="hidden md:flex items-center gap-4">
                {/* Home Button */}
                <Link 
                  to="/" 
                  className="p-2 text-[#111827] hover:text-[#2563EB] transition-colors"
                  title="Home"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </Link>
                {user ? (
                  <>
                    <Link to="/cart" className="relative p-2 text-[#111827] hover:text-[#2563EB] transition-colors">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </Link>
                    {(user.role === 'product provider' || user.role === 'seller' || user.role === 'service provider') && (
                      <Link 
                        to="/dashboard" 
                        className="p-2 text-[#111827] hover:text-[#2563EB] transition-colors"
                        title="Provider Dashboard"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </Link>
                    )}
                    {(user.role === 'admin' || user.role === 'super admin' || user.role === 'marketing team') && (
                      <Link 
                        to="/promotions" 
                        className="p-2 text-[#111827] hover:text-[#2563EB] transition-colors"
                        title="Promotions"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </Link>
                    )}
                    {(user.role === 'admin' || user.role === 'super admin') && (
                      <Link 
                        to="/admin" 
                        className="p-2 text-[#111827] hover:text-[#2563EB] transition-colors"
                        title="Admin Dashboard"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                      </Link>
                    )}
                    <div className="flex items-center gap-3">
                      <span className="text-[#111827] text-sm font-medium">{user.name}</span>
                      <button
                        onClick={logout}
                        className="text-[#111827] hover:text-[#2563EB] transition-colors font-medium text-sm"
                      >
                        Logout
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/register" 
                      className="bg-[#2563EB] text-white p-2.5 rounded-lg hover:bg-[#1d4ed8] transition-all shadow-sm hover:shadow-md"
                      title="Sign Up"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile - Sign In Button Only */}
              {!user ? (
                <Link 
                  to="/login" 
                  className="md:hidden bg-[#2563EB] text-white px-4 py-2 rounded-lg hover:bg-[#1d4ed8] transition-all shadow-sm hover:shadow-md text-sm font-medium"
                >
                  Sign In
                </Link>
              ) : (
                <div className="md:hidden flex items-center gap-2">
                  <span className="text-[#111827] text-sm font-medium truncate max-w-[100px]">{user.name}</span>
                  <button
                    onClick={logout}
                    className="text-[#2563EB] text-sm font-medium"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile - Search Input Below Navbar */}
      <div className="md:hidden bg-white border-b border-[#E5E7EB] px-4 py-3">
        <form onSubmit={handleSearch} className="w-full">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products..."
              className="w-full px-4 py-3 pl-12 pr-16 border border-[#E5E7EB] rounded-full focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] outline-none text-sm"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#2563EB] hover:bg-[#1d4ed8] text-white px-4 py-1.5 rounded-full transition-colors text-sm font-medium"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Mobile - Categories Below Search Input */}
      <div className="md:hidden bg-white border-b border-[#E5E7EB] py-2">
        <div className="overflow-x-auto scrollbar-hide px-4">
          <div className="flex gap-2 min-w-max">
            {categories.map((category) => (
              <Link
                key={category}
                to={`/products?category=${encodeURIComponent(category)}`}
                className="flex-shrink-0 px-4 py-2 bg-gray-100 hover:bg-[#2563EB] text-gray-700 hover:text-white rounded-full text-sm font-medium transition-colors whitespace-nowrap"
              >
                {category}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;


