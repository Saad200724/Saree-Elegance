import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useProducts } from "@/hooks/use-products";
import { ArrowRight, Star, Truck, ShieldCheck, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import sareeCategory from "@/assets/images/saree-category.png";
import lehengaCategory from "@/assets/images/lehenga-category.png";
import pakistaniCategory from "@/assets/images/pakistani-category.png";
import alponaBg from "@assets/Alpona_withoutbg_1771979242690.png";

export default function Home() {
  const { data: newArrivals, isLoading } = useProducts({ search: "new" }); // Just fetching some products for now
  
  const sareeBanner = "/images/hero.png";

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[25vh] md:h-[75vh] w-full overflow-hidden rounded-b-3xl bg-[#4a3728]">
        <div 
          className="absolute inset-0 bg-contain md:bg-cover bg-center bg-no-repeat md:bg-fixed"
          style={{ backgroundImage: `url(/hero-bg.jpg)` }}
        ></div>
        
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center text-center">
          {/* Content overlay if needed, but keeping image clear as requested */}
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-12 md:py-20 bg-white relative overflow-hidden">
        <div 
          className="absolute top-0 left-0 w-64 h-64 opacity-10 pointer-events-none -translate-x-1/2 -translate-y-1/2 rotate-12"
          style={{ backgroundImage: `url(${alponaBg})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat' }}
        />
        <div 
          className="absolute bottom-0 right-0 w-96 h-96 opacity-10 pointer-events-none translate-x-1/4 translate-y-1/4 -rotate-12"
          style={{ backgroundImage: `url(${alponaBg})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat' }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="font-heading text-2xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-4">Curated Categories</h2>
            <p className="text-gray-500 text-sm md:text-base max-w-lg mx-auto">Explore our wide range of traditional and contemporary attire.</p>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-3 gap-2 md:gap-8">
            {/* Category 1 */}
            <Link href="/sarees" className="group relative aspect-square rounded-lg md:rounded-xl overflow-hidden cursor-pointer">
              <img src={sareeCategory} alt="Sarees" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-80 group-hover:opacity-70 transition-opacity" />
              <div className="absolute bottom-2 left-2 md:bottom-6 md:left-6 text-white">
                <h3 className="font-heading text-xs md:text-2xl font-bold mb-1 md:mb-2">Sarees</h3>
                <span className="hidden md:inline-flex items-center text-sm font-medium group-hover:underline">Shop Now <ArrowRight className="ml-2 w-4 h-4" /></span>
              </div>
            </Link>

            {/* Category 2 */}
            <Link href="/lehengas" className="group relative aspect-square rounded-lg md:rounded-xl overflow-hidden cursor-pointer">
              <img src={lehengaCategory} alt="Lehengas" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-80 group-hover:opacity-70 transition-opacity" />
              <div className="absolute bottom-2 left-2 md:bottom-6 md:left-6 text-white">
                <h3 className="font-heading text-xs md:text-2xl font-bold mb-1 md:mb-2">Lehengas</h3>
                <span className="hidden md:inline-flex items-center text-sm font-medium group-hover:underline">Shop Now <ArrowRight className="ml-2 w-4 h-4" /></span>
              </div>
            </Link>

            {/* Category 3 */}
            <Link href="/pakistani-dresses" className="group relative aspect-square rounded-lg md:rounded-xl overflow-hidden cursor-pointer">
              <img src={pakistaniCategory} alt="Pakistani Dress" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-80 group-hover:opacity-70 transition-opacity" />
              <div className="absolute bottom-2 left-2 md:bottom-6 md:left-6 text-white">
                <h3 className="font-heading text-xs md:text-2xl font-bold mb-1 md:mb-2">Pakistani</h3>
                <span className="hidden md:inline-flex items-center text-sm font-medium group-hover:underline">Shop Now <ArrowRight className="ml-2 w-4 h-4" /></span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-6 md:mb-10">
            <div>
              <span className="text-accent font-bold tracking-wider uppercase text-[10px] md:text-xs mb-1 md:mb-2 block">Just In</span>
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-gray-900">Latest Collections</h2>
            </div>
            <Link href="/shop" className="hidden md:flex items-center text-primary font-medium hover:text-accent transition-colors">
              View All <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
             <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-48 md:h-96 bg-gray-200 animate-pulse rounded-xl" />
                ))}
             </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
              {newArrivals?.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          
          <div className="mt-8 text-center md:hidden">
            <Button asChild variant="outline" size="sm">
              <Link href="/shop">View All Products</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="py-12 md:py-16 bg-white border-y border-gray-100 relative overflow-hidden">
        <div 
          className="absolute top-1/2 left-0 w-48 h-48 opacity-5 pointer-events-none -translate-x-1/2 -translate-y-1/2"
          style={{ backgroundImage: `url(${alponaBg})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat' }}
        />
        <div 
          className="absolute top-1/2 right-0 w-48 h-48 opacity-5 pointer-events-none translate-x-1/2 -translate-y-1/2"
          style={{ backgroundImage: `url(${alponaBg})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat' }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-3 md:grid-cols-3 gap-2 md:gap-8">
            <div className="flex flex-col items-center text-center p-2 md:p-6 rounded-xl md:rounded-2xl bg-gray-50/50 border border-gray-100">
              <div className="flex mb-1 md:mb-4 text-yellow-400">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-2 h-2 md:w-4 md:h-4 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 italic mb-2 md:mb-4 text-[10px] md:text-sm line-clamp-3 md:line-clamp-none">"চন্দ্রাবতীর শাড়িগুলোর মান সত্যিই অসাধারণ। রঙের কাজ আর কাপড়ের গুণগত মান আমাকে মুগ্ধ করেছে।"</p>
              <h4 className="font-heading font-bold text-primary text-[8px] md:text-base">— সুস্মিতা</h4>
            </div>
            <div className="flex flex-col items-center text-center p-2 md:p-6 rounded-xl md:rounded-2xl bg-gray-50/50 border border-gray-100">
              <div className="flex mb-1 md:mb-4 text-yellow-400">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-2 h-2 md:w-4 md:h-4 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 italic mb-2 md:mb-4 text-[10px] md:text-sm line-clamp-3 md:line-clamp-none">"বিয়ের জন্য এখান থেকে লেহেঙ্গা নিয়েছিলাম। ডিজাইনটা ইউনিক ছিল, ফিটিংটাও পারফেক্ট।"</p>
              <h4 className="font-heading font-bold text-primary text-[8px] md:text-base">— নুসরাত</h4>
            </div>
            <div className="flex flex-col items-center text-center p-2 md:p-6 rounded-xl md:rounded-2xl bg-gray-50/50 border border-gray-100">
              <div className="flex mb-1 md:mb-4 text-yellow-400">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-2 h-2 md:w-4 md:h-4 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 italic mb-2 md:mb-4 text-[10px] md:text-sm line-clamp-3 md:line-clamp-none">"অনলাইনে অর্ডার করতে প্রথমে ভয় পাচ্ছিলাম, কিন্তু চন্দ্রাবতী আমার বিশ্বাস জয় করে নিয়েছে।"</p>
              <h4 className="font-heading font-bold text-primary text-[8px] md:text-base">— ফারহানা</h4>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
