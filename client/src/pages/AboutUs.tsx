import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const AboutUs: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gray-50 py-16 md:py-24 border-b">
          <div className="container mx-auto px-6 text-center max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 text-gray-900 tracking-tight">
              Our Story
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed font-light italic">
              "Sarees That Define You"
            </p>
          </div>
        </section>

        {/* Brand Philosophy */}
        <section className="container mx-auto px-6 py-16 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-3xl font-serif font-bold mb-6 text-primary">
                Welcome to চন্দ্রাবতী
              </h2>
              <div className="space-y-6 text-gray-700 leading-relaxed text-lg">
                <p>
                  Founded with a passion for timeless elegance, <span className="font-semibold text-primary font-hindi text-xl">চন্দ্রাবতী</span> (Chandrabati) is a premier boutique dedicated to bringing you the finest collection of traditional and contemporary attire.
                </p>
                <p>
                  We believe that a saree is not just a piece of cloth; it is a canvas of heritage, 
                  a reflection of grace, and a storyteller of traditions. From the intricate 
                  weaves of traditional handlooms to the grandeur of modern bridal lehengas, 
                  every piece in our collection is handpicked to ensure it meets the highest 
                  standards of quality and artistry.
                </p>
              </div>
            </div>

            {/* Logo Box with established date */}
            <div className="order-1 md:order-2 relative group flex justify-center">
              <div className="bg-white rounded-2xl aspect-square w-full max-w-md flex flex-col items-center justify-center border border-gray-100 shadow-2xl p-12 transition-all duration-500 hover:-translate-y-2">
                {/* In TSX, /logo.png points to your public folder directly.
                   If you use Next.js, consider using <Image /> for optimization.
                */}
                <img 
                  src="/logo.png" 
                  alt="Chandrabati Logo" 
                  className="max-h-56 w-auto object-contain mb-8 drop-shadow-md"
                />
                <div className="text-center w-full">
                  <div className="h-px w-16 bg-primary/20 mx-auto mb-4"></div>
                  <p className="text-gray-400 font-serif tracking-[0.3em] text-xs uppercase">
                    Established 2025
                  </p>
                </div>
              </div>
              {/* Decorative Frame */}
              <div className="absolute -z-10 top-6 -right-6 w-full h-full border-2 border-primary/5 rounded-2xl hidden md:block"></div>
            </div>
          </div>
        </section>

        {/* Value Propositions */}
        <section className="bg-stone-50 py-20">
          <div className="container mx-auto px-6 max-w-6xl">
            <h2 className="text-3xl font-serif font-bold text-center mb-16 text-gray-900">
              The Chandrabati Promise
            </h2>
            <div className="grid md:grid-cols-3 gap-10">
              <div className="bg-white p-10 rounded-xl shadow-sm border border-stone-100 text-center hover:shadow-md transition-shadow">
                <div className="text-4xl mb-6">✨</div>
                <h3 className="font-serif font-bold text-xl mb-3">Exquisite Curation</h3>
                <p className="text-gray-600 leading-relaxed">
                  Every design is hand-selected to ensure you radiate confidence and elegance in every room you enter.
                </p>
              </div>
              <div className="bg-white p-10 rounded-xl shadow-sm border border-stone-100 text-center hover:shadow-md transition-shadow">
                <div className="text-4xl mb-6">🧵</div>
                <h3 className="font-serif font-bold text-xl mb-3">Heritage Craft</h3>
                <p className="text-gray-600 leading-relaxed">
                  We bridge the gap between ancient weaving techniques and modern aesthetics, keeping our culture alive.
                </p>
              </div>
              <div className="bg-white p-10 rounded-xl shadow-sm border border-stone-100 text-center hover:shadow-md transition-shadow">
                <div className="text-4xl mb-6">💖</div>
                <h3 className="font-serif font-bold text-xl mb-3">Personalized Service</h3>
                <p className="text-gray-600 leading-relaxed">
                  To us, you aren't just a customer; you are part of the Chandrabati family. We treat every order with soul.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Quote Section */}
        <section className="container mx-auto px-6 py-24 text-center max-w-3xl">
          <div className="mb-8 flex justify-center">
            <span className="text-5xl text-primary/20 font-serif">“</span>
          </div>
          <p className="text-2xl md:text-3xl font-serif italic text-gray-800 leading-snug">
            Experience the elegance of traditional handloom and contemporary designs.
          </p>
          <div className="mt-10 h-1 w-24 bg-primary mx-auto rounded-full"></div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AboutUs;