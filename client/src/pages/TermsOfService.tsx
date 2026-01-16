import { Link } from 'react-router-dom';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-block mb-6">
            <img 
              src="/logo2.png" 
              alt="da-hi Logo" 
              className="h-12 w-auto"
            />
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-gray-600">
            Last updated: January 2026
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p>
              Welcome to da-hi Marketplace ("we," "our," or "us"). These Terms of Service ("Terms") govern your access to and use of our online marketplace platform, including our website, mobile applications, and related services (collectively, the "Service").
            </p>
            <p>
              By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of these Terms, then you may not access the Service. These Terms apply to all visitors, users, buyers, sellers, and others who access or use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
            <p>
              da-hi Marketplace is an online platform that connects buyers and sellers, facilitating the purchase and sale of products. We provide a venue for sellers to list products and for buyers to purchase products from sellers. We are not a party to any transaction between buyers and sellers, except as a payment processor and service facilitator.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.1 Account Creation</h3>
            <p>To use certain features of our Service, you must register for an account. You agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and update your account information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.2 Account Types</h3>
            <p>We offer different account types:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Individual:</strong> For personal buyers</li>
              <li><strong>Product Provider/Seller:</strong> For sellers listing products</li>
              <li><strong>Admin:</strong> For platform administrators</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.3 Account Termination</h3>
            <p>
              We reserve the right to suspend or terminate your account at any time for violations of these Terms, fraudulent activity, or any other reason we deem necessary to protect our platform and users.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. User Responsibilities</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.1 General Obligations</h3>
            <p>All users must:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Comply with all applicable local, state, national, and international laws</li>
              <li>Provide accurate and truthful information</li>
              <li>Respect the rights of other users</li>
              <li>Not engage in fraudulent, deceptive, or illegal activities</li>
              <li>Not interfere with the operation of the Service</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.2 Seller Obligations</h3>
            <p>Sellers agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Accurately describe products and pricing</li>
              <li>Honor all confirmed orders</li>
              <li>Ship products in a timely manner</li>
              <li>Comply with all applicable product safety and consumer protection laws</li>
              <li>Handle returns and refunds according to our policies</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.3 Buyer Obligations</h3>
            <p>Buyers agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate shipping and payment information</li>
              <li>Pay for purchased items in a timely manner</li>
              <li>Review product descriptions and terms before purchase</li>
              <li>Communicate honestly with sellers</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Products and Listings</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">5.1 Product Listings</h3>
            <p>Sellers are responsible for the accuracy of product listings. We reserve the right to remove any listing that violates these Terms or applicable laws.</p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">5.2 Prohibited Items</h3>
            <p>The following items are prohibited:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Illegal products or services</li>
              <li>Counterfeit or stolen goods</li>
              <li>Hazardous materials</li>
              <li>Items that infringe on intellectual property rights</li>
              <li>Any product that violates local laws or regulations</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">5.3 Product Availability</h3>
            <p>
              Product availability is not guaranteed. We are not responsible for out-of-stock items or pricing errors. Sellers reserve the right to cancel orders for unavailable items.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Payments and Transactions</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">6.1 Payment Processing</h3>
            <p>
              We facilitate payment processing between buyers and sellers. Payments are processed through secure third-party payment processors. By making a purchase, you agree to our payment terms.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">6.2 Pricing</h3>
            <p>
              All prices are set by sellers and are subject to change. We are not responsible for pricing errors, but will work to resolve any issues that arise.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">6.3 Fees</h3>
            <p>
              We may charge transaction fees or service fees as disclosed at the time of purchase. All fees are non-refundable unless required by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Disputes Between Users</h2>
            <p>
              da-hi Marketplace is not responsible for disputes between buyers and sellers. We facilitate transactions but are not a party to the sale contract. Users are encouraged to resolve disputes directly. However, we may provide dispute resolution assistance at our discretion.
            </p>
            <p>
              We are not liable for any loss or damage resulting from disputes, including but not limited to product quality issues, delivery problems, or payment disputes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality are owned by da-hi Marketplace and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
            <p>
              Users retain ownership of content they submit (product listings, reviews, etc.) but grant us a license to use, display, and distribute such content on our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, DA-HI MARKETPLACE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
            </p>
            <p>
              Our total liability for any claims arising from your use of the Service shall not exceed the amount you paid us in the 12 months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Indemnification</h2>
            <p>
              You agree to defend, indemnify, and hold harmless da-hi Marketplace and its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses, including reasonable attorney's fees, arising out of or in any way connected with your use of the Service or violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Privacy</h2>
            <p>
              Your use of the Service is also governed by our Privacy Policy. Please review our Privacy Policy to understand our practices regarding the collection and use of your information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Modifications to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify users of material changes by posting the new Terms on this page and updating the "Last updated" date. Your continued use of the Service after such modifications constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Termination</h2>
            <p>
              We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including breach of these Terms. Upon termination, your right to use the Service will immediately cease.
            </p>
            <p>
              You may terminate your account at any time by contacting us or using the account closure feature in your account settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Governing Law</h2>
            <p>
              These Terms shall be governed and construed in accordance with the laws of Ethiopia, without regard to its conflict of law provisions. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts of Ethiopia.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mt-4">
              <p className="mb-2"><strong>Email:</strong> <a href="mailto:hilarygebremedhn28@gmail.com" className="text-[#16A34A] hover:underline">hilarygebremedhn28@gmail.com</a></p>
              <p className="mb-2"><strong>Phone:</strong> <a href="tel:+251989834889" className="text-[#16A34A] hover:underline">+251 989 834 889</a></p>
              <p><strong>Address:</strong> Ethiopia</p>
            </div>
          </section>
        </div>

        {/* Back Button */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <Link 
            to="/" 
            className="inline-flex items-center text-[#16A34A] hover:text-[#15803D] font-semibold transition-colors"
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

export default TermsOfService;
