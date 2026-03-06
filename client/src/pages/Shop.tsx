import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/use-products";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import bannerImg from "@/assets/images/banner.jpg";
import alponaDesignHome from "@/assets/images/Alpona_Design.png";

export default function Shop() {
  const [category, setCategory] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  // Debounce could be added here for search
  const { data: products, isLoading } = useProducts({ 
    category: category === "all" ? undefined : category, 
    search: searchTerm 
  });

  return (
    <div 
      className="min-h-screen flex flex-col bg-white"
    >
      <Navbar />

      {/* Header Banner */}
      <section className="relative h-[25vh] md:h-[40vh] w-full overflow-hidden rounded-b-3xl bg-gray-900">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bannerImg})` }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative h-full max-w-7xl mx-auto px-4 flex flex-col justify-center items-center text-white text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-2 md:mb-4 font-heading">Our Collection</h1>
          <p className="text-sm md:text-lg max-w-2xl opacity-90 px-4">
            Browse our extensive collection of premium ethnic wear, suitable for every celebration.
          </p>
        </div>
      </section>

      <div className="flex-1 max-w-7xl w-full mx-auto px-6 lg:px-12 py-20">
        
        {/* Filters Toolbar - Ultra Minimalist Center Aligned */}
        <div className="flex flex-col items-center gap-12 mb-24">
          <div className="flex flex-col items-center text-center space-y-4">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.6em] text-primary">The Collection</h2>
            <div className="flex items-center gap-8">
              {["all", "Saree", "Lehenga", "Three Piece", "Party Dress", "Pakistani Dress"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`text-[10px] font-bold uppercase tracking-[0.2em] pb-2 transition-all border-b-2 ${
                    category === cat || (cat === "all" && !category)
                      ? "border-black text-black"
                      : "border-transparent text-gray-400 hover:text-black"
                  }`}
                >
                  {cat === "all" ? "All Pieces" : cat}
                </button>
              ))}
            </div>
          </div>
          
          <div className="w-full max-w-md relative group">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
            <Input 
              placeholder="Search by name or aesthetic..." 
              className="pl-8 h-12 bg-transparent border-0 border-b border-gray-100 focus:border-black rounded-none transition-all text-sm focus:ring-0 placeholder:italic placeholder:font-light text-center"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Product Grid - Editorial Spacing */}
        {isLoading ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-16">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="aspect-[3/4] bg-gray-50 animate-pulse" />
              ))}
           </div>
        ) : products?.length === 0 ? (
          <div className="text-center py-40">
            <h3 className="text-sm font-bold uppercase tracking-[0.3em] text-gray-300">No pieces found in this curation</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
            {products?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
