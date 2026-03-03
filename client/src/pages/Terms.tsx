import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Terms() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 container mx-auto px-6 py-16 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-8 text-primary border-b pb-4">
          Terms of Service
        </h1>

        <div className="prose prose-stone max-w-none text-gray-700 leading-relaxed">
          <p className="text-lg italic text-gray-600 mb-8">
            Welcome to <span className="text-primary font-semibold font-hindi">চন্দ্রাবতী</span>. 
            We are delighted to have you here. By browsing our collection or making a purchase, 
            you agree to the following terms, which ensure a smooth and elegant shopping experience for everyone.
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Our Promise</h2>
            <p>
              At চন্দ্রাবতী, we strive to bring you sarees, lehengas, and dresses that define your grace. 
              While we make every effort to display the colors and textures of our fabrics accurately, 
              please note that slight variations may occur due to screen settings or the handcrafted nature of our products.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Your Account</h2>
            <p>
              When you create an account with us, you are responsible for maintaining the confidentiality 
              of your login details. Please ensure your information is accurate so we can deliver your 
              favorite pieces without delay.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Orders & Payments</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>All prices are listed in BDT (unless stated otherwise).</li>
              <li>We reserve the right to refuse or cancel an order in the event of an inventory error or pricing inaccuracy.</li>
              <li>Once an order is confirmed, we begin the process of preparing your selection with care.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Shipping & Delivery</h2>
            <p>
              We aim to deliver your elegance to your doorstep as quickly as possible. Delivery timelines 
              may vary based on your location. চন্দ্রাবতী is not responsible for delays caused by external 
              courier services, but we will always assist you in tracking your package.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Returns & Exchanges</h2>
            <p>
              We want you to love what you wear. If there is a genuine quality defect or a wrong item sent, 
              please contact us within <span className="font-semibold">24-48 hours</span> of delivery. 
              Items must be unused, unwashed, and in their original packaging with tags intact.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Intellectual Property</h2>
            <p>
              All content on this website—including images, logos, and designs—is the soulful property of 
              <span className="font-semibold text-primary font-hindi"> চন্দ্রাবতী</span>. 
              We kindly ask that you do not use our creative assets for commercial purposes without our written consent.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Privacy</h2>
            <p>
              Your trust is beautiful to us. We handle your personal data with the utmost respect and 
              security, as detailed in our Privacy Policy.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Updates to Terms</h2>
            <p>
              As we grow and evolve, we may update these terms. We encourage you to check this page 
              occasionally to stay informed.
            </p>
          </section>

          <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
            <p className="mb-2">If you have any questions about these terms, feel free to reach out to us:</p>
            <p className="font-medium text-primary">Phone: 01805-108818</p>
            <p className="mt-6 text-sm text-gray-500 italic">
              Thank you for choosing চন্দ্রাবতী. We hope our collection makes you feel as beautiful as you truly are.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}