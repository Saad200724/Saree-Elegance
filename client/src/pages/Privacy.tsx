import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 container mx-auto px-6 py-16 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-8 text-primary border-b pb-4">
          Privacy Policy
        </h1>

        <div className="prose prose-stone max-w-none text-gray-700 leading-relaxed">
          <p className="text-lg italic text-gray-600 mb-8">
            Your trust is the most beautiful thing we wear. At <span className="text-primary font-semibold font-hindi">চন্দ্রাবতী</span>, 
            we are committed to protecting your personal information and ensuring your shopping journey is safe and secure.
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
            <p>To provide you with a seamless experience, we collect certain details when you visit our site or make a purchase:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>Personal Details:</strong> Your name, email address, and phone number.</li>
              <li><strong>Delivery Info:</strong> Your shipping and billing addresses to get your sarees to you.</li>
              <li><strong>Device Info:</strong> Basic data like your IP address and browser type to improve our website's performance.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Data</h2>
            <p>We use your information with the utmost care to:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Process and deliver your orders accurately.</li>
              <li>Send you updates about your shipment.</li>
              <li>Share occasional "sweet" surprises, like new collections or special offers (only if you choose to hear from us!).</li>
              <li>Improve our collection based on what you love the most.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Keeping Your Data Safe</h2>
            <p>
              We treat your data like our own. We use industry-standard security measures to protect your 
              personal information from unauthorized access. Your payment details are processed through 
              secure gateways, and we never store your full credit card or banking information on our servers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Sharing with Third Parties</h2>
            <p>
              We do not sell or trade your personal information. We only share necessary details with 
              trusted partners—such as our delivery heroes—to ensure your package reaches you safely.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Cookies</h2>
            <p>
              Our website uses cookies to remember your preferences and make your next visit even 
              more delightful. You can choose to disable cookies in your browser settings, though 
              some features of our shop may work best with them enabled.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Rights</h2>
            <p>
              You have the right to access, update, or request the deletion of your personal data at 
              any time. Simply reach out to us, and we will be happy to assist you.
            </p>
          </section>

          <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Privacy Questions?</h2>
            <p className="mb-2">If you have any concerns regarding how we handle your data, we are here to help:</p>
            <p className="font-medium text-primary">Phone: 01805-108818</p>
            <p className="mt-6 text-sm text-gray-500 italic">
              Thank you for trusting চন্দ্রাবতী with your elegance.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
