import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Phone, MapPin, Facebook } from "lucide-react";

export default function Contact() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-6">Contact Us</h1>
        <div className="space-y-6">
          <div className="flex items-center gap-4 text-lg">
            <Phone className="text-primary" />
            <span>01805-108818</span>
          </div>
          <div className="flex items-center gap-4 text-lg">
            <MapPin className="text-primary" />
            <span>Peace view apartment, Fakir garments road, Narayanganj, Bangladesh</span>
          </div>
          <div className="flex items-center gap-4 text-lg">
            <Facebook className="text-primary h-6 w-6" />
            <a href="https://www.facebook.com/profile.php?id=61584594611053" target="_blank" rel="noreferrer" className="hover:underline text-primary font-medium">
              Facebook Page of চন্দ্রাবতী
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
