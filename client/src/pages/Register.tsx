import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const categories = [
  "Fashion & Apparel",
  "Electronics",
  "Home & Living",
  "Beauty & Personal Care",
  "Sports & Outdoors",
  "Books",
  "Toys & Games",
  "Food & Beverages",
];

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [userType, setUserType] = useState<'individual' | 'product provider' | null>(null);
  const [providerType, setProviderType] = useState<'freelancer' | 'small business' | 'specialized' | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    phone: '',
    alternativePhone: '',
    whatsapp: '',
    telegram: '',
    referralCode: '',
    idDocument: null as File | null,
    companyName: '',
    productType: '',
    workExperience: '',
    gender: '',
    city: '',
    location: '',
    serviceCenterPhotos: [] as File[],
    introductionVideo: null as File | null,
    servicePriceList: null as File | null,
    crCertificate: null as File | null,
    professionalCertificate: null as File | null,
    portfolioPhotos: [] as File[],
    privacyConsent: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (field: string, files: FileList | null) => {
    if (!files) return;
    
    if (field === 'serviceCenterPhotos' || field === 'portfolioPhotos') {
      const fileArray = Array.from(files).slice(0, 5);
      setFormData({ ...formData, [field]: fileArray });
    } else {
      setFormData({ ...formData, [field]: files[0] || null });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!userType) {
      setError('Please select a registration type');
      return;
    }

    if (userType === 'product provider' && !providerType) {
      setError('Please select a provider type');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!formData.privacyConsent) {
      setError('Please consent to the Privacy Policy & Merchant Service Agreement');
      return;
    }

    setLoading(true);

    try {
      // Prepare registration data
      const registrationData: any = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: userType === 'individual' ? 'individual' : 'product provider',
        phone: formData.phone,
        alternativePhone: formData.alternativePhone || undefined,
        whatsapp: formData.whatsapp || undefined,
        telegram: formData.telegram || undefined,
        address: formData.address,
        city: formData.city || undefined,
        location: formData.location || undefined,
        referralCode: formData.referralCode || undefined,
        privacyConsent: formData.privacyConsent,
      };

      // Add product provider specific fields
      if (userType === 'product provider') {
        registrationData.providerType = providerType;
        registrationData.serviceType = formData.productType;
        registrationData.workExperience = formData.workExperience;
        
        if (providerType === 'freelancer') {
          registrationData.gender = formData.gender;
        }
        
        if (providerType === 'small business' || providerType === 'specialized') {
          registrationData.companyName = formData.companyName;
        }
      }

      // Remove undefined values
      Object.keys(registrationData).forEach(key => {
        if (registrationData[key] === undefined || registrationData[key] === '') {
          delete registrationData[key];
        }
      });

      await register(registrationData);
      navigate('/products');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Helper variables for type checking (outside conditional blocks)
  const isIndividual = userType === 'individual';
  const isProductProvider = userType === 'product provider';

  // Individual Registration Form
  if (userType === 'individual') {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900">Create Your Account</h2>
            <p className="mt-2 text-sm text-gray-600">Join thousands of satisfied customers</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6 md:p-8 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">I am registering as:</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setUserType('individual')}
                  className={`p-4 border-2 rounded-lg text-center transition-all ${
                    isIndividual
                      ? 'border-[#16A34A] bg-[#16A34A]/5'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-2xl mb-2">👤</div>
                  <div className="font-semibold">Buyer</div>
                  <div className="text-xs text-gray-500 mt-1">Find products</div>
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('product provider')}
                  className={`p-4 border-2 rounded-lg text-center transition-all ${
                    isProductProvider
                      ? 'border-[#16A34A] bg-[#16A34A]/5'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-2xl mb-2">🏢</div>
                  <div className="font-semibold">Product Provider</div>
                  <div className="text-xs text-gray-500 mt-1">Offer products</div>
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#16A34A] focus:border-[#16A34A]"
                placeholder="Enter your full name"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#16A34A] focus:border-[#16A34A]"
                placeholder="g.fikre2@gmail.com"
              />
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address <span className="text-red-500">*</span>
              </label>
              <input
                id="address"
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#16A34A] focus:border-[#16A34A]"
                placeholder="Enter your complete address"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#16A34A] focus:border-[#16A34A]"
                placeholder="+251 9X XXX XXXX"
              />
            </div>

            {/* WhatsApp */}
            <div>
              <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp (Optional)
              </label>
              <input
                id="whatsapp"
                type="tel"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#16A34A] focus:border-[#16A34A]"
                placeholder="+251 9X XXX XXXX"
              />
            </div>

            {/* Telegram */}
            <div>
              <label htmlFor="telegram" className="block text-sm font-medium text-gray-700 mb-1">
                Telegram (Optional)
              </label>
              <input
                id="telegram"
                type="text"
                value={formData.telegram}
                onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#16A34A] focus:border-[#16A34A]"
                placeholder="@username"
              />
            </div>

            {/* Referral Code */}
            <div>
              <label htmlFor="referralCode" className="block text-sm font-medium text-gray-700 mb-1">
                Referral Code (Optional)
              </label>
              <input
                id="referralCode"
                type="text"
                value={formData.referralCode}
                onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#16A34A] focus:border-[#16A34A]"
                placeholder="Enter referral code if you have one"
              />
              <p className="mt-1 text-xs text-gray-500">Have a referral code? Enter it here to support the person who referred you!</p>
            </div>

            {/* ID Document */}
            <div>
              <label htmlFor="idDocument" className="block text-sm font-medium text-gray-700 mb-1">
                Upload ID Document <span className="text-red-500">*</span>
              </label>
              <input
                id="idDocument"
                type="file"
                required
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange('idDocument', e.target.files)}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#16A34A] file:text-white hover:file:bg-[#15803D]"
              />
              <p className="mt-1 text-xs text-gray-500">Accepted formats: PDF, JPG, PNG (Max 5MB)</p>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#16A34A] focus:border-[#16A34A]"
                placeholder="••••••••••••"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#16A34A] focus:border-[#16A34A]"
                placeholder="Confirm your password"
              />
            </div>

            {/* Privacy Consent */}
            <div className="flex items-start">
              <input
                id="privacyConsent"
                type="checkbox"
                required
                checked={formData.privacyConsent}
                onChange={(e) => setFormData({ ...formData, privacyConsent: e.target.checked })}
                className="mt-1 h-4 w-4 text-[#16A34A] focus:ring-[#16A34A] border-gray-300 rounded"
              />
              <label htmlFor="privacyConsent" className="ml-2 text-sm text-gray-700">
                I consent to the collection and processing of my personal data in line with data regulations as described in the{' '}
                <Link to="/privacy-policy" className="text-[#16A34A] hover:underline">Privacy Policy</Link> and <Link to="/terms-of-service" className="text-[#16A34A] hover:underline">Terms of Service</Link>.
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#16A34A] hover:bg-[#15803D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#16A34A] disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-[#16A34A] hover:text-[#15803D]">
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>
    );
  }

  // Product Provider Registration Form
  if (userType === 'product provider') {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900">Register as Product Provider</h2>
            <p className="mt-2 text-sm text-gray-600">Start your product business journey with us</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6 md:p-8 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">I am registering as:</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setUserType('individual')}
                  className={`p-4 border-2 rounded-lg text-center transition-all ${
                    isIndividual
                      ? 'border-[#16A34A] bg-[#16A34A]/5'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-2xl mb-2">👤</div>
                  <div className="font-semibold">Buyer</div>
                  <div className="text-xs text-gray-500 mt-1">Find products</div>
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('product provider')}
                  className={`p-4 border-2 rounded-lg text-center transition-all ${
                    isProductProvider
                      ? 'border-[#16A34A] bg-[#16A34A]/5'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-2xl mb-2">🏢</div>
                  <div className="font-semibold">Product Provider</div>
                  <div className="text-xs text-gray-500 mt-1">Offer products</div>
                </button>
              </div>
            </div>

            {/* Provider Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Provider Type</label>
              <div className="grid grid-cols-3 gap-4">
                {(['freelancer', 'small business', 'specialized'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setProviderType(type)}
                    className={`p-4 border-2 rounded-lg text-center transition-all ${
                      providerType === type
                        ? 'border-[#16A34A] bg-[#16A34A]/5'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-2xl mb-2">
                      {type === 'freelancer' ? '💼' : type === 'small business' ? '🏪' : '🏭'}
                    </div>
                    <div className="font-semibold capitalize">{type === 'small business' ? 'Small Business' : type === 'specialized' ? 'Specialized' : 'Freelancer'}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {type === 'freelancer' ? 'Individual professional' : type === 'small business' ? 'Local business' : 'Large enterprise'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Company Information - Only for Small Business and Specialized */}
            {(providerType === 'small business' || providerType === 'specialized') && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="companyName"
                    type="text"
                    required={providerType === 'small business' || providerType === 'specialized'}
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#16A34A] focus:border-[#16A34A]"
                    placeholder="Enter company name"
                  />
                </div>
              </div>
            )}

            {/* Product Type */}
            <div>
              <label htmlFor="productType" className="block text-sm font-medium text-gray-700 mb-1">
                Product Type <span className="text-red-500">*</span>
              </label>
              <select
                id="productType"
                required
                value={formData.productType}
                onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#16A34A] focus:border-[#16A34A]"
              >
                <option value="">Select Product Type</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Work Experience */}
            <div>
              <label htmlFor="workExperience" className="block text-sm font-medium text-gray-700 mb-1">
                Work Experience (in years) <span className="text-red-500">*</span>
              </label>
              <select
                id="workExperience"
                required
                value={formData.workExperience}
                onChange={(e) => setFormData({ ...formData, workExperience: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#16A34A] focus:border-[#16A34A]"
              >
                <option value="">Select Work Experience</option>
                <option value="0">Less than 1 year</option>
                <option value="1">1-2 years</option>
                <option value="3">3-5 years</option>
                <option value="6">6-10 years</option>
                <option value="11">More than 10 years</option>
              </select>
            </div>

            {/* Gender - Only for Freelancer */}
            {providerType === 'freelancer' && (
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  id="gender"
                  required={providerType === 'freelancer'}
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#16A34A] focus:border-[#16A34A]"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            )}

            {/* Full Name - For Freelancer */}
            {providerType === 'freelancer' && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#16A34A] focus:border-[#16A34A]"
                  placeholder="Enter your full name"
                />
              </div>
            )}

            {/* Contact Information */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#16A34A] focus:border-[#16A34A]"
                  placeholder="company@example.com"
                />
              </div>

              <div className="mt-4">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Phone <span className="text-red-500">*</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#16A34A] focus:border-[#16A34A]"
                  placeholder="+251 9X XXX XXXX"
                />
              </div>

              <div className="mt-4">
                <label htmlFor="alternativePhone" className="block text-sm font-medium text-gray-700 mb-1">
                  Alternative Phone
                </label>
                <input
                  id="alternativePhone"
                  type="tel"
                  value={formData.alternativePhone}
                  onChange={(e) => setFormData({ ...formData, alternativePhone: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#16A34A] focus:border-[#16A34A]"
                  placeholder="+251 9X XXX XXXX"
                />
              </div>

              <div className="mt-4">
                <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp (Optional)
                </label>
                <input
                  id="whatsapp"
                  type="tel"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#16A34A] focus:border-[#16A34A]"
                  placeholder="+251 9X XXX XXXX"
                />
              </div>

              <div className="mt-4">
                <label htmlFor="telegram" className="block text-sm font-medium text-gray-700 mb-1">
                  Telegram (Optional)
                </label>
                <input
                  id="telegram"
                  type="text"
                  value={formData.telegram}
                  onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#16A34A] focus:border-[#16A34A]"
                  placeholder="@company_username"
                />
              </div>
            </div>

            {/* Location Information */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Information</h3>
              
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <select
                  id="city"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#16A34A] focus:border-[#16A34A]"
                >
                  <option value="">Select City</option>
                  <option value="addis ababa">Addis Ababa</option>
                  <option value="dire dawa">Dire Dawa</option>
                  <option value="hawassa">Hawassa</option>
                  <option value="mekelle">Mekelle</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="mt-4">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  id="location"
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#16A34A] focus:border-[#16A34A]"
                  placeholder="Enter your location"
                />
              </div>
            </div>

            {/* Required Documents */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Required Documents</h3>
              
              {/* Product Center Photos - Only for Small Business and Specialized */}
              {(providerType === 'small business' || providerType === 'specialized') && (
                <div className="mb-4">
                  <label htmlFor="serviceCenterPhotos" className="block text-sm font-medium text-gray-700 mb-1">
                    Product Center Photos (up to 5)
                  </label>
                  <input
                    id="serviceCenterPhotos"
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange('serviceCenterPhotos', e.target.files)}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#16A34A] file:text-white hover:file:bg-[#15803D]"
                  />
                  <p className="mt-1 text-xs text-gray-500">Upload photos of your product center/facility</p>
                </div>
              )}

              {/* Product Quality Photos or Receipts - Only for Freelancer */}
              {providerType === 'freelancer' && (
                <div className="mb-4">
                  <label htmlFor="portfolioPhotos" className="block text-sm font-medium text-gray-700 mb-1">
                    Product Quality Photos or Receipts (up to 5)
                  </label>
                  <input
                    id="portfolioPhotos"
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange('portfolioPhotos', e.target.files)}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#16A34A] file:text-white hover:file:bg-[#15803D]"
                  />
                  <p className="mt-1 text-xs text-gray-500">Upload photos showing product quality or purchase receipts</p>
                </div>
              )}

              {/* Government ID - Only for Freelancer */}
              {providerType === 'freelancer' && (
                <div className="mb-4">
                  <label htmlFor="idDocument" className="block text-sm font-medium text-gray-700 mb-1">
                    Government ID / Driving Licence / Passport <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="idDocument"
                    type="file"
                    required={providerType === 'freelancer'}
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange('idDocument', e.target.files)}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#16A34A] file:text-white hover:file:bg-[#15803D]"
                  />
                  <p className="mt-1 text-xs text-gray-500">Upload your government ID, driving licence, or passport</p>
                </div>
              )}

              {/* CR Certificate - Only for Small Business and Specialized */}
              {(providerType === 'small business' || providerType === 'specialized') && (
                <div className="mb-4">
                  <label htmlFor="crCertificate" className="block text-sm font-medium text-gray-700 mb-1">
                    CR Certificate <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="crCertificate"
                    type="file"
                    required={providerType === 'small business' || providerType === 'specialized'}
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange('crCertificate', e.target.files)}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#16A34A] file:text-white hover:file:bg-[#15803D]"
                  />
                  <p className="mt-1 text-xs text-gray-500">Upload your CR (Commercial Registration) certificate</p>
                </div>
              )}

              {/* Business License/Registration */}
              <div className="mb-4">
                <label htmlFor="professionalCertificate" className="block text-sm font-medium text-gray-700 mb-1">
                  Business License/Registration {providerType === 'freelancer' ? <span className="text-gray-500">(Optional)</span> : <span className="text-red-500">*</span>}
                </label>
                <input
                  id="professionalCertificate"
                  type="file"
                    required={providerType === 'small business' || providerType === 'specialized'}
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange('professionalCertificate', e.target.files)}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#16A34A] file:text-white hover:file:bg-[#15803D]"
                />
                <p className="mt-1 text-xs text-gray-500">Upload your business license or registration certificate</p>
              </div>

              {/* Product Price List */}
              <div className="mb-4">
                <label htmlFor="servicePriceList" className="block text-sm font-medium text-gray-700 mb-1">
                  Product Price List/Quotation Document
                </label>
                <input
                  id="servicePriceList"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileChange('servicePriceList', e.target.files)}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#16A34A] file:text-white hover:file:bg-[#15803D]"
                />
                <p className="mt-1 text-xs text-gray-500">Upload your product pricing document (PDF preferred)</p>
              </div>
            </div>

            {/* Account Security */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Security</h3>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#16A34A] focus:border-[#16A34A]"
                  placeholder="••••••••••••"
                />
              </div>

              <div className="mt-4">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#16A34A] focus:border-[#16A34A]"
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            {/* Privacy Consent */}
            <div className="flex items-start">
              <input
                id="privacyConsent"
                type="checkbox"
                required
                checked={formData.privacyConsent}
                onChange={(e) => setFormData({ ...formData, privacyConsent: e.target.checked })}
                className="mt-1 h-4 w-4 text-[#16A34A] focus:ring-[#16A34A] border-gray-300 rounded"
              />
              <label htmlFor="privacyConsent" className="ml-2 text-sm text-gray-700">
                I consent to the collection and processing of my personal data in line with data regulations as described in the{' '}
                <Link to="/privacy-policy" className="text-[#16A34A] hover:underline">Privacy Policy</Link> and <Link to="/terms-of-service" className="text-[#16A34A] hover:underline">Terms of Service</Link>.
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#16A34A] hover:bg-[#15803D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#16A34A] disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register as Product Provider'}
            </button>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-[#16A34A] hover:text-[#15803D]">
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>
    );
  }

  // Initial Role Selection Screen
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">Create Your Account</h2>
          <p className="mt-2 text-sm text-gray-600">Join thousands of satisfied customers</p>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-8">
          <label className="block text-sm font-medium text-gray-700 mb-4">I am registering as:</label>
          <div className="grid grid-cols-2 gap-6">
            <button
              type="button"
              onClick={() => setUserType('individual')}
              className="p-6 border-2 border-gray-300 rounded-lg text-center hover:border-[#16A34A] hover:bg-[#16A34A]/5 transition-all"
            >
              <div className="text-4xl mb-3">👤</div>
              <div className="font-semibold text-lg">Buyer</div>
              <div className="text-sm text-gray-500 mt-2">Find products</div>
            </button>
            <button
              type="button"
              onClick={() => setUserType('product provider')}
              className="p-6 border-2 border-gray-300 rounded-lg text-center hover:border-[#16A34A] hover:bg-[#16A34A]/5 transition-all"
            >
              <div className="text-4xl mb-3">🏢</div>
              <div className="font-semibold text-lg">Product Provider</div>
              <div className="text-sm text-gray-500 mt-2">Offer products</div>
            </button>
          </div>

          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-[#16A34A] hover:text-[#15803D]">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
