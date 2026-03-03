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
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      <Navbar />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">
          
          {/* Image Section */}
          <div className="sticky top-24">
            <div className="aspect-[3/4] rounded-3xl overflow-hidden bg-white shadow-2xl shadow-gray-200/50 relative group border border-gray-100">
              <img 
                src={product.imageUrl} 
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <button className="absolute top-6 right-6 p-4 bg-white/90 backdrop-blur-md rounded-full text-gray-400 hover:text-red-500 hover:bg-white transition-all shadow-xl hover:scale-110 active:scale-95">
                <Heart className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Info Section */}
          <div className="flex flex-col pt-4">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 text-[10px] font-bold text-accent bg-accent/10 rounded-full tracking-widest uppercase">{product.category}</span>
              {product.stock > 0 ? (
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  In Stock
                </span>
              ) : (
                <span className="text-[10px] font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full uppercase tracking-widest">Out of Stock</span>
              )}
            </div>
            
            <h1 className="font-heading text-5xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">{product.name}</h1>
            
            <div className="flex items-center gap-6 mb-8">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < 4 ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} />
                ))}
              </div>
              <span className="text-gray-400 text-sm font-medium hover:text-gray-600 transition-colors cursor-pointer underline underline-offset-4">{reviews?.length || 0} Professional Reviews</span>
            </div>

            <div className="flex items-baseline gap-6 mb-10">
              <span className="text-4xl font-black text-gray-900 tracking-tighter">৳{Number(product.price).toLocaleString()}</span>
              {product.originalPrice && (
                <span className="text-2xl text-gray-300 line-through font-medium italic">৳{Number(product.originalPrice).toLocaleString()}</span>
              )}
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm mb-10">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">The Narrative</h3>
              <p className="text-gray-500 leading-relaxed text-lg font-light">
                {product.description}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-6 mb-12">
              <div className="flex items-center gap-6">
                <div className="flex items-center bg-white border border-gray-100 rounded-2xl p-1 shadow-sm">
                  <button onClick={decrement} className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 rounded-xl text-gray-500 transition-all hover:text-gray-900 active:scale-90">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 font-bold text-lg text-center text-gray-900">{quantity}</span>
                  <button onClick={increment} className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 rounded-xl text-gray-500 transition-all hover:text-gray-900 active:scale-90">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                <Button 
                  onClick={handleAddToCart} 
                  disabled={addToCart.isPending || product.stock === 0}
                  size="lg" 
                  className="flex-1 bg-gray-900 hover:bg-black text-white text-base font-bold h-14 rounded-2xl shadow-xl shadow-gray-200 transition-all active:scale-[0.98]"
                >
                  {addToCart.isPending ? "Securing item..." : "Add to Collection"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Products */}
        {recommendedProducts.length > 0 && (
          <div className="mt-32">
            <div className="flex flex-col items-center mb-12">
              <h2 className="font-heading text-3xl font-bold text-gray-900 mb-4 tracking-tight">Curated for You</h2>
              <div className="h-1 w-20 bg-accent rounded-full" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {recommendedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

        {/* Tabs Section */}
        <div className="mt-32 pt-20 border-t border-gray-100">
          <div className="flex justify-center gap-12 mb-16">
            <button 
              onClick={() => setActiveTab('desc')}
              className={`pb-4 font-heading font-bold text-sm tracking-widest uppercase transition-all relative ${activeTab === 'desc' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Artisan Details
              {activeTab === 'desc' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-full" />}
            </button>
            <button 
              onClick={() => setActiveTab('reviews')}
              className={`pb-4 font-heading font-bold text-sm tracking-widest uppercase transition-all relative ${activeTab === 'reviews' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Guest Reviews ({reviews?.length || 0})
              {activeTab === 'reviews' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-full" />}
            </button>
          </div>

          <div className="max-w-3xl mx-auto">
            {activeTab === 'desc' ? (
              <div className="prose prose-lg max-w-none text-gray-500 font-light leading-relaxed">
                <p>{product.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                  <div className="bg-white p-6 rounded-2xl border border-gray-50 shadow-sm">
                    <h4 className="text-gray-900 font-bold mb-3 uppercase tracking-wider text-xs">Exquisite Material</h4>
                    <p className="text-sm">Finest grade heritage textiles selected for durability and comfort.</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-gray-50 shadow-sm">
                    <h4 className="text-gray-900 font-bold mb-3 uppercase tracking-wider text-xs">Artisan Crafted</h4>
                    <p className="text-sm">Intricate detailing performed by master craftsmen with decades of experience.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-12">
                {reviews?.length === 0 ? (
                  <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                    <p className="text-gray-400 font-medium italic">Be the first to share your experience with this piece.</p>
                  </div>
                ) : (
                  reviews?.map(review => (
                    <div key={review.id} className="bg-white p-8 rounded-3xl border border-gray-50 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-bold text-gray-900 text-lg">{review.reviewerName}</span>
                        <div className="flex text-amber-400">
                          {[...Array(5)].map((_, i) => (
                             <Star key={i} className={`w-4 h-4 ${i < review.rating ? "fill-current" : "text-gray-100"}`} />
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
