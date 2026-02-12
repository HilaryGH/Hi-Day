import { Link } from 'react-router-dom';

const UserDataDeletion = () => {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(to bottom right, rgba(239, 246, 255, 0.6), rgba(255, 255, 255, 0.7), rgba(250, 245, 255, 0.6))' }}>
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">User Data Deletion</h1>
          <p className="text-gray-600">
            Last updated: January 2026
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">How to Request Data Deletion</h2>
            <p>
              If you would like to delete your account and all associated data from da-hi Marketplace, you can do so by following these steps:
            </p>
            <ol className="list-decimal pl-6 space-y-3 mt-4">
              <li>
                <strong>Send a deletion request:</strong> Email us at <a href="mailto:support@dahimart.com" className="text-[#16A34A] hover:underline">support@dahimart.com</a> with the subject line "Data Deletion Request"
              </li>
              <li>
                <strong>Include your information:</strong> In your email, please provide:
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Your registered email address</li>
                  <li>Your full name</li>
                  <li>Confirmation that you want to delete your account and all associated data</li>
                </ul>
              </li>
              <li>
                <strong>Verification:</strong> We may contact you to verify your identity before processing the deletion request
              </li>
              <li>
                <strong>Processing time:</strong> We will process your request within 30 days of verification
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">What Data Will Be Deleted</h2>
            <p>When you request data deletion, we will permanently delete:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Your account information (name, email, phone number)</li>
              <li>Your profile data and preferences</li>
              <li>Your order history and transaction records</li>
              <li>Your product listings (if you are a seller)</li>
              <li>Your reviews and ratings</li>
              <li>Your cart and saved items</li>
              <li>Any uploaded images or files associated with your account</li>
            </ul>
            <p className="mt-4">
              <strong>Note:</strong> Some data may be retained for legal or regulatory compliance purposes, such as:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Financial transaction records required by law</li>
              <li>Data necessary for resolving disputes or legal claims</li>
              <li>Anonymized analytics data that cannot be linked to you</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Facebook Login Users</h2>
            <p>
              If you logged in using Facebook, you can also request data deletion directly through this page. When you send us a deletion request, we will:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Delete all data associated with your Facebook account</li>
              <li>Remove the connection between your Facebook account and our platform</li>
              <li>Permanently delete your account and all associated information</li>
            </ul>
            <p className="mt-4">
              After deletion, you will no longer be able to access your account or any data associated with it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Alternative Method</h2>
            <p>
              You can also delete your account directly from your account settings if you are logged in:
            </p>
            <ol className="list-decimal pl-6 space-y-2 mt-4">
              <li>Log in to your account</li>
              <li>Go to Account Settings</li>
              <li>Click on "Delete Account" or "Close Account"</li>
              <li>Follow the on-screen instructions to confirm deletion</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
            <p>
              If you have any questions about data deletion or need assistance with your request, please contact us:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mt-4">
              <p className="mb-2"><strong>Email:</strong> <a href="mailto:support@dahimart.com" className="text-[#16A34A] hover:underline">support@dahimart.com</a></p>
              <p className="mb-2"><strong>Phone:</strong> <a href="tel:+251977684476" className="text-[#16A34A] hover:underline">+251 977 684 476</a></p>
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

export default UserDataDeletion;


