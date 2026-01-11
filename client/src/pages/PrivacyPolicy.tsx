import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-block mb-6">
            <img 
              src="/logo da-hi.png" 
              alt="da-hi Logo" 
              className="h-16 w-auto"
            />
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-600">
            Last updated: January 2026
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p>
              Welcome to da-hi Marketplace ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, disclose, and safeguard your information when you use our marketplace platform.
            </p>
            <p>
              By using our service, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.1 Personal Information</h3>
            <p>We collect information that you provide directly to us, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Information:</strong> Name, email address, phone number, password (hashed)</li>
              <li><strong>Profile Information:</strong> Avatar/image, address, delivery preferences</li>
              <li><strong>Transaction Information:</strong> Purchase history, payment information, shipping addresses</li>
              <li><strong>Seller Information:</strong> Business details, product listings, bank account information (for sellers)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.2 Authentication Information</h3>
            <p>When you log in using social media platforms (Google, Facebook), we may collect:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your profile information from the social media platform</li>
              <li>Email address associated with your social media account</li>
              <li>Profile picture</li>
              <li>Unique identifier from the social media platform</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.3 Automatically Collected Information</h3>
            <p>We automatically collect certain information when you use our service:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Device Information:</strong> IP address, browser type, operating system</li>
              <li><strong>Usage Data:</strong> Pages visited, time spent on pages, click patterns</li>
              <li><strong>Location Data:</strong> General location information (if permitted)</li>
              <li><strong>Cookies and Tracking:</strong> We use cookies to enhance your experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p>We use the collected information for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Management:</strong> To create and manage your account, authenticate users</li>
              <li><strong>Service Delivery:</strong> To process transactions, fulfill orders, facilitate payments</li>
              <li><strong>Communication:</strong> To send order updates, respond to inquiries, send marketing communications (with consent)</li>
              <li><strong>Improvement:</strong> To improve our service, analyze usage patterns, develop new features</li>
              <li><strong>Security:</strong> To detect and prevent fraud, abuse, and security threats</li>
              <li><strong>Legal Compliance:</strong> To comply with legal obligations and enforce our terms</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Sharing and Disclosure</h2>
            <p>We do not sell your personal information. We may share your information in the following circumstances:</p>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.1 Service Providers</h3>
            <p>We share information with trusted third-party service providers who assist us in operating our platform, such as:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Payment processors</li>
              <li>Shipping and delivery partners</li>
              <li>Cloud hosting services</li>
              <li>Analytics providers</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.2 Business Transactions</h3>
            <p>In the event of a merger, acquisition, or sale of assets, your information may be transferred to the new entity.</p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.3 Legal Requirements</h3>
            <p>We may disclose your information if required by law or in response to valid legal requests.</p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.4 With Your Consent</h3>
            <p>We may share your information with third parties when you explicitly consent to such sharing.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure.
            </p>
            <p>
              We use industry-standard security measures including encryption, secure socket layer (SSL) technology, and secure password hashing. Access to your personal information is restricted to authorized personnel only.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Rights and Choices</h2>
            <p>You have the following rights regarding your personal information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Access:</strong> Request access to your personal information</li>
              <li><strong>Correction:</strong> Request correction of inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal requirements)</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              <li><strong>Account Closure:</strong> Close your account at any time</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, please contact us at <a href="mailto:hilarygebremedhn28@gmail.com" className="text-[#F97316] hover:underline">hilarygebremedhn28@gmail.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar tracking technologies to track activity on our service and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Third-Party Links</h2>
            <p>
              Our service may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to review the privacy policies of any third-party sites you visit.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Children's Privacy</h2>
            <p>
              Our service is not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required or permitted by law. When you close your account, we will delete or anonymize your personal information, subject to legal and regulatory requirements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to This Privacy Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date. You are advised to review this policy periodically for any changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mt-4">
              <p className="mb-2"><strong>Email:</strong> <a href="mailto:hilarygebremedhn28@gmail.com" className="text-[#F97316] hover:underline">hilarygebremedhn28@gmail.com</a></p>
              <p className="mb-2"><strong>Phone:</strong> <a href="tel:+251989834889" className="text-[#F97316] hover:underline">+251 989 834 889</a></p>
              <p><strong>Address:</strong> Ethiopia</p>
            </div>
          </section>
        </div>

        {/* Back Button */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <Link 
            to="/" 
            className="inline-flex items-center text-[#F97316] hover:text-[#EA580C] font-semibold transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
