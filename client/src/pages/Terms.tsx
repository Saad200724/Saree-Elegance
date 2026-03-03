import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Terms() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
        <div className="prose max-w-none text-gray-700">
          <p>Welcome to চন্দ্রাবতী. By accessing our website, you agree to comply with our terms and conditions.</p>
          {/* Add more terms here */}
        </div>
      </main>
      <Footer />
    </div>
  );
}
