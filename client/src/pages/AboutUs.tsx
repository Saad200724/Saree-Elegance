import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AboutUs() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-6">About Us</h1>
        <p className="text-lg text-gray-700 leading-relaxed">
          চন্দ্রাবতী (Chandrabati) is a premier boutique dedicated to bringing you the finest collection of traditional and contemporary attire. From exquisite sarees to bridal lehengas, we curate pieces that define your elegance and heritage.
        </p>
      </main>
      <Footer />
    </div>
  );
}
