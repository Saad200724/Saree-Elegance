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
      className="min-h-screen flex flex-col bg-gray-50 bg-fixed bg-no-repeat bg-center"
      style={{ 
        backgroundImage: `url(${alponaDesignHome})`,
        backgroundSize: '100% 100%',
        backgroundAttachment: 'fixed',
      }}
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

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Filters Toolbar - Minimalist Floating */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-20">
          
          <div className="w-full md:w-1/3">
             <div className="relative group">
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder="Search the collection..." 
                  className="pl-8 h-12 bg-transparent border-0 border-b border-gray-200 focus:border-primary rounded-none transition-all text-sm focus:ring-0 placeholder:italic placeholder:font-light"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
          </div>

          <div className="flex items-center gap-8 w-full md:w-auto">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Curation</span>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-[200px] h-12 bg-transparent border-0 border-b border-gray-200 rounded-none text-xs font-bold uppercase tracking-widest focus:ring-0">
                  <SelectValue placeholder="All Pieces" />
                </SelectTrigger>
                <SelectContent className="rounded-none border-gray-100">
                  <SelectItem value="all" className="text-xs uppercase tracking-widest font-semibold">All Pieces</SelectItem>
                  <SelectItem value="Saree" className="text-xs uppercase tracking-widest font-semibold">Sarees</SelectItem>
                  <SelectItem value="Lehenga" className="text-xs uppercase tracking-widest font-semibold">Lehengas</SelectItem>
                  <SelectItem value="Three Piece" className="text-xs uppercase tracking-widest font-semibold">Three Piece</SelectItem>
                  <SelectItem value="Party Dress" className="text-xs uppercase tracking-widest font-semibold">Party Dress</SelectItem>
                  <SelectItem value="Pakistani Dress" className="text-xs uppercase tracking-widest font-semibold">Pakistani Dress</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

        </div>

        {/* Product Grid - More air between cards */}
        {isLoading ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
              {[1,2,3,4,5,6,7,8].map(i => (
                <div key={i} className="aspect-[4/5] bg-gray-100 animate-pulse" />
              ))}
           </div>
        ) : products?.length === 0 ? (
          <div className="text-center py-40">
            <h3 className="text-xl font-heading font-light text-gray-400 italic">Our archives are currently empty for this selection.</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12 lg:gap-16">
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
