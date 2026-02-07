import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useProducts } from "@/hooks/use-products";
import { ArrowRight, Star, Truck, ShieldCheck, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
export default function Home() {
  const { data: newArrivals, isLoading } = useProducts({ search: "new" }); // Just fetching some products for now
  
  const sareeBanner = "/images/saree-banner_1770467409528.png";

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
      <section className="relative h-[85vh] w-full overflow-hidden bg-gray-900">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${sareeBanner})` }}
        ></div>
        
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mb-4">Curated Categories</h2>
            <p className="text-gray-500 max-w-lg mx-auto">Explore our wide range of traditional and contemporary attire.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Category 1 */}
            <Link href="/sarees" className="group relative h-96 rounded-xl overflow-hidden cursor-pointer">
              {/* Unsplash: Indian woman in red saree */}
              <img src="https://images.unsplash.com/photo-1583391733958-d023e669968e?w=800&auto=format&fit=crop" alt="Sarees" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-80 group-hover:opacity-70 transition-opacity" />
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="font-heading text-2xl font-bold mb-2">Exquisite Sarees</h3>
                <span className="inline-flex items-center text-sm font-medium group-hover:underline">Shop Now <ArrowRight className="ml-2 w-4 h-4" /></span>
              </div>
            </Link>

            {/* Category 2 */}
            <Link href="/lehengas" className="group relative h-96 rounded-xl overflow-hidden cursor-pointer">
               {/* Unsplash: detailed embroidery fabric */}
              <img src="https://images.unsplash.com/photo-1595995057056-b040d7c7eb98?w=800&auto=format&fit=crop" alt="Lehengas" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-80 group-hover:opacity-70 transition-opacity" />
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="font-heading text-2xl font-bold mb-2">Bridal Lehengas</h3>
                <span className="inline-flex items-center text-sm font-medium group-hover:underline">Shop Now <ArrowRight className="ml-2 w-4 h-4" /></span>
              </div>
            </Link>

            {/* Category 3 */}
            <Link href="/pakistani-dresses" className="group relative h-96 rounded-xl overflow-hidden cursor-pointer md:col-span-1">
               {/* Unsplash: fashion model dress */}
              <img src="https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&auto=format&fit=crop" alt="Pakistani Dress" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-80 group-hover:opacity-70 transition-opacity" />
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="font-heading text-2xl font-bold mb-2">Pakistani Dress</h3>
                <span className="inline-flex items-center text-sm font-medium group-hover:underline">Shop Now <ArrowRight className="ml-2 w-4 h-4" /></span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <span className="text-accent font-bold tracking-wider uppercase text-xs mb-2 block">Just In</span>
              <h2 className="font-heading text-3xl font-bold text-gray-900">Latest Collections</h2>
            </div>
            <Link href="/shop" className="hidden md:flex items-center text-primary font-medium hover:text-accent transition-colors">
              View All <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-96 bg-gray-200 animate-pulse rounded-xl" />
                ))}
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newArrivals?.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          
          <div className="mt-8 text-center md:hidden">
            <Button asChild variant="outline">
              <Link href="/shop">View All Products</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features / Trust Badges */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-50 text-accent rounded-full flex items-center justify-center mb-4">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg mb-2">Free Shipping</h3>
              <p className="text-gray-500 text-sm">On all orders over ৳10,000 across the country</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-50 text-accent rounded-full flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg mb-2">Secure Payment</h3>
              <p className="text-gray-500 text-sm">100% secure payment with trusted gateways</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-50 text-accent rounded-full flex items-center justify-center mb-4">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg mb-2">Easy Returns</h3>
              <p className="text-gray-500 text-sm">Hassle-free 30 days return policy</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
