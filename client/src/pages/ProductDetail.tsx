import { useRoute, useLocation } from "wouter";
import { useProduct, useProductReviews, useProducts } from "@/hooks/use-products";
import { useAddToCart } from "@/hooks/use-cart";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Share2, Heart, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function ProductDetail() {
  const [match, params] = useRoute("/product/:id");
  const [, setLocation] = useLocation();
  const productId = parseInt(params?.id || "0");
  
  const { data: product, isLoading, error } = useProduct(productId);
  const { data: reviews } = useProductReviews(productId);
  const { data: allProducts } = useProducts({});
  const addToCart = useAddToCart();
  const { toast } = useToast();
  
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'reviews'>('desc');

  if (isLoading) return <ProductSkeleton />;
  if (error || !product) return <ProductNotFound />;

  const recommendedProducts = allProducts
    ?.filter(p => p.id !== product.id && p.category === product.category)
    .slice(0, 4) || [];

  const handleAddToCart = () => {
    addToCart.mutate({ productId, quantity });
  };

  const increment = () => setQuantity(q => q + 1);
  const decrement = () => setQuantity(q => Math.max(1, q - 1));

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          
          {/* Image Section - Edge to Edge on Mobile, Half Screen on Desktop */}
          <div className="relative h-[70vh] lg:h-[calc(100vh-80px)] sticky top-20">
            <img 
              src={product.imageUrl} 
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
            {product.isNewArrival && (
              <div className="absolute top-10 left-10">
                <span className="bg-black text-white text-[10px] font-bold uppercase tracking-[0.4em] px-6 py-2">
                  Limited Edition
                </span>
              </div>
            )}
          </div>

          {/* Info Section - Scrollable on Desktop */}
          <div className="px-6 py-12 lg:p-24 flex flex-col justify-center max-w-2xl mx-auto lg:mx-0">
            <div className="space-y-12">
              <header className="space-y-4">
                <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">
                  <span>{product.category}</span>
                  <div className="w-8 h-px bg-gray-200" />
                  <span className={product.stock > 0 ? "text-emerald-600" : "text-red-500"}>
                    {product.stock > 0 ? "In Stock" : "Sold Out"}
                  </span>
                </div>
                <h1 className="font-heading text-4xl lg:text-6xl font-bold text-gray-900 tracking-tighter leading-none uppercase">
                  {product.name}
                </h1>
                <div className="flex items-center gap-6 pt-4">
                  <span className="text-3xl font-light tracking-tighter text-gray-900">
                    ৳{Number(product.price).toLocaleString()}
                  </span>
                  {product.originalPrice && (
                    <span className="text-xl text-gray-300 line-through font-extralight tracking-tighter">
                      ৳{Number(product.originalPrice).toLocaleString()}
                    </span>
                  )}
                </div>
              </header>

              <div className="space-y-6">
                <p className="text-gray-500 text-lg font-light leading-relaxed">
                  {product.description}
                </p>
                <div className="grid grid-cols-2 gap-8 pt-6 border-t border-gray-100">
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-black mb-2">Material</h4>
                    <p className="text-xs text-gray-500 font-light">Hand-selected premium silk blend with heritage embroidery.</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-black mb-2">Care</h4>
                    <p className="text-xs text-gray-500 font-light">Dry clean only. Preserve the artisan craftsmanship.</p>
                  </div>
                </div>
              </div>

              {/* Purchase Actions */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-200 h-16 px-4">
                    <button onClick={decrement} className="p-2 hover:text-primary transition-colors"><Minus className="w-3 h-3" /></button>
                    <span className="w-12 text-center font-bold text-sm">{quantity}</span>
                    <button onClick={increment} className="p-2 hover:text-primary transition-colors"><Plus className="w-3 h-3" /></button>
                  </div>
                  <Button 
                    onClick={handleAddToCart} 
                    disabled={addToCart.isPending || product.stock === 0}
                    className="flex-1 bg-black hover:bg-gray-900 text-white h-16 rounded-none text-xs font-bold uppercase tracking-[0.3em] transition-all"
                  >
                    {addToCart.isPending ? "Adding..." : "Add to Shopping Bag"}
                  </Button>
                </div>
                <button className="w-full h-16 border border-black text-black text-xs font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-all">
                  <Heart className="w-4 h-4" /> Add to Wishlist
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 py-12 border-y border-gray-100">
                <div className="text-center space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-[0.1em]">Free Shipping</div>
                  <div className="text-[9px] text-gray-400">On all orders</div>
                </div>
                <div className="text-center space-y-2 border-x border-gray-100">
                  <div className="text-[10px] font-bold uppercase tracking-[0.1em]">7-Day Returns</div>
                  <div className="text-[9px] text-gray-400">Hassle free</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-[0.1em]">Secure Payment</div>
                  <div className="text-[9px] text-gray-400">100% Protected</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Curated Selection Section */}
        {recommendedProducts.length > 0 && (
          <section className="py-24 px-6 lg:px-12 bg-[#fafafa]">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-end mb-16">
                <div>
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.5em] text-primary mb-4">The Collection</h2>
                  <h3 className="text-3xl lg:text-4xl font-heading font-bold uppercase tracking-tighter">You May Also Like</h3>
                </div>
                <a href="/shop" className="text-xs font-bold uppercase tracking-[0.2em] border-b-2 border-black pb-1 mb-1">View All</a>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                {recommendedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Skeleton className="h-[600px] w-full rounded-2xl" />
          <div className="space-y-6">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-40 w-full" />
            <div className="flex gap-4">
              <Skeleton className="h-14 w-32" />
              <Skeleton className="h-14 flex-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProductNotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <h2 className="font-heading text-3xl font-bold mb-4">Product Not Found</h2>
        <p className="text-gray-500 mb-8">The product you are looking for does not exist or has been removed.</p>
        <Button asChild><a href="/shop">Back to Shop</a></Button>
      </div>
    </div>
  )
}
