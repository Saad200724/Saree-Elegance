import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
        <div className="prose max-w-none text-gray-700">
          <p>Your privacy is important to us. We collect only the information necessary to provide you with the best shopping experience.</p>
          {/* Add more privacy policy here */}
        </div>
      </main>
      <Footer />
    </div>
  );
}
