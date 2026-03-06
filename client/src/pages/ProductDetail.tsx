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
    <div className="min-h-screen flex flex-col bg-[#FDFCFB]">
      <Navbar />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 xl:gap-24">
          
          {/* Image Section - Takes up 7/12 columns for cinematic feel */}
          <div className="lg:col-span-7 sticky top-32">
            <div className="aspect-[4/5] bg-[#F9F8F6] overflow-hidden relative group">
              <img 
                src={product.imageUrl} 
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
              />
              <button className="absolute top-8 right-8 p-4 bg-white/80 backdrop-blur-md rounded-full text-gray-400 hover:text-primary hover:bg-white transition-all duration-300 shadow-xl hover:scale-110 active:scale-95">
                <Heart className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Info Section - 5/12 columns */}
          <div className="lg:col-span-5 flex flex-col pt-4">
            <div className="flex items-center gap-4 mb-8">
              <span className="text-[11px] font-bold text-accent tracking-[0.3em] uppercase">{product.category}</span>
              <div className="w-px h-4 bg-gray-200" />
              {product.stock > 0 ? (
                <span className="flex items-center gap-2 text-[10px] font-semibold text-emerald-600 uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Available Exclusively
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-red-500 uppercase tracking-widest">Waitlist Only</span>
              )}
            </div>
            
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-[1.15] tracking-tight">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-10">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3.5 h-3.5 ${i < 4 ? "text-primary fill-primary" : "text-gray-200"}`} />
                ))}
              </div>
              <span className="text-gray-400 text-xs font-medium tracking-widest uppercase italic">{reviews?.length || 0} Verified Critiques</span>
            </div>

            <div className="flex items-baseline gap-6 mb-12 border-b border-gray-100 pb-10">
              <span className="text-4xl font-bold text-primary tracking-tighter">৳{Number(product.price).toLocaleString()}</span>
              {product.originalPrice && (
                <span className="text-xl text-gray-300 line-through font-light italic">৳{Number(product.originalPrice).toLocaleString()}</span>
              )}
            </div>

            <div className="mb-12">
              <h3 className="text-[11px] font-bold text-gray-900 uppercase tracking-[0.2em] mb-4">The Narrative</h3>
              <p className="text-gray-600 leading-relaxed text-lg font-light italic">
                "{product.description}"
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-8">
              <div className="flex items-center gap-6">
                <div className="flex items-center border border-gray-200 h-14 bg-white">
                  <button onClick={decrement} className="w-14 h-full flex items-center justify-center hover:bg-gray-50 text-gray-400 transition-colors">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 font-semibold text-gray-900 text-center">{quantity}</span>
                  <button onClick={increment} className="w-14 h-full flex items-center justify-center hover:bg-gray-50 text-gray-400 transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                <Button 
                  onClick={handleAddToCart} 
                  disabled={addToCart.isPending || product.stock === 0}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white text-xs font-bold h-14 rounded-none tracking-[0.2em] uppercase shadow-2xl shadow-primary/20 transition-all active:scale-[0.98]"
                >
                  {addToCart.isPending ? "Requesting..." : "Add to Collection"}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white border border-gray-100 flex flex-col items-center text-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Shipping</span>
                  <span className="text-xs text-gray-500 font-light">Worldwide Complimentary</span>
                </div>
                <div className="p-4 bg-white border border-gray-100 flex flex-col items-center text-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Authenticity</span>
                  <span className="text-xs text-gray-500 font-light">Certified Artisan Made</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Products */}
        {recommendedProducts.length > 0 && (
          <div className="mt-40">
            <div className="flex flex-col items-center mb-16">
              <span className="text-accent text-[11px] font-bold uppercase tracking-[0.4em] mb-4">Refinement</span>
              <h2 className="font-heading text-3xl font-bold text-gray-900 tracking-tight">Curated Accompaniments</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12">
              {recommendedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

        {/* Tabs Section - Minimalist */}
        <div className="mt-40 pt-20 border-t border-gray-100">
          <div className="flex justify-center gap-16 mb-20">
            {['desc', 'reviews'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`pb-4 text-[11px] font-bold tracking-[0.3em] uppercase transition-all relative ${activeTab === tab ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {tab === 'desc' ? 'Artisanship' : `Critiques (${reviews?.length || 0})`}
                {activeTab === tab && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary" />}
              </button>
            ))}
          </div>

          <div className="max-w-4xl mx-auto">
            {activeTab === 'desc' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                <div className="space-y-6">
                  <h4 className="text-primary font-bold text-[10px] uppercase tracking-[0.2em]">Heritage Materials</h4>
                  <p className="text-gray-600 font-light leading-relaxed italic">"Selected from the finest looms, our textiles represent centuries of weaving tradition, offering a tactile experience that transcends modern alternatives."</p>
                </div>
                <div className="space-y-6">
                  <h4 className="text-primary font-bold text-[10px] uppercase tracking-[0.2em]">The Master's Hand</h4>
                  <p className="text-gray-600 font-light leading-relaxed italic">"Each stitch is a testament to the artisan's patience. Our pieces aren't manufactured; they are composed over weeks of meticulous handwork."</p>
                </div>
              </div>
            ) : (
              <div className="space-y-12">
                {reviews?.length === 0 ? (
                  <div className="text-center py-24 bg-gray-50/50">
                    <p className="text-gray-400 text-xs font-medium uppercase tracking-widest italic">Awaiting your narrative</p>
                  </div>
                ) : (
                  reviews?.map(review => (
                    <div key={review.id} className="bg-white p-10 border border-gray-50">
                      <div className="flex items-center justify-between mb-6">
                        <span className="font-bold text-gray-900 uppercase tracking-widest text-xs">{review.reviewerName}</span>
                        <div className="flex gap-1 text-primary">
                          {[...Array(5)].map((_, i) => (
                             <Star key={i} className={`w-3 h-3 ${i < review.rating ? "fill-current" : "text-gray-100"}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-500 font-light text-lg italic leading-relaxed">"{review.comment}"</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
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
