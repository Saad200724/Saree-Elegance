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

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        
        {/* Filters Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 md:mb-8 bg-white p-3 md:p-4 rounded-xl shadow-sm border border-gray-100">
          
          <div className="flex items-center w-full md:w-auto gap-4">
             <div className="relative flex-1 md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input 
                  placeholder="Search products..." 
                  className="pl-9 h-10 md:h-11 bg-gray-50 border-gray-200 focus:bg-white transition-all text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
              <Filter className="w-3 md:w-4 h-3 md:h-4" />
              <span>Filter:</span>
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="flex-1 md:w-[180px] h-10 md:h-11 bg-gray-50 border-gray-200 text-sm">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Saree">Sarees</SelectItem>
                <SelectItem value="Lehenga">Lehengas</SelectItem>
                <SelectItem value="Three Piece">Three Piece</SelectItem>
                <SelectItem value="Party Dress">Party Dress</SelectItem>
                <SelectItem value="Pakistani Dress">Pakistani Dress</SelectItem>
              </SelectContent>
            </Select>
          </div>

        </div>

        {/* Product Grid */}
        {isLoading ? (
           <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-8">
              {[1,2,3,4,5,6,7,8].map(i => (
                <div key={i} className="h-48 md:h-[400px] bg-gray-200 animate-pulse rounded-xl" />
              ))}
           </div>
        ) : products?.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-lg font-medium text-gray-900">No products found</h3>
            <p className="text-gray-500 text-sm">Try adjusting your search or filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-8">
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
