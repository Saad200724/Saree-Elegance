import { useRoute, useLocation } from "wouter";
import { useProduct, useProductReviews } from "@/hooks/use-products";
import { useAddToCart } from "@/hooks/use-cart";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Truck, Shield, Share2, Heart, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function ProductDetail() {
  const [match, params] = useRoute("/product/:id");
  const [, setLocation] = useLocation();
  const productId = parseInt(params?.id || "0");
  
  const { data: product, isLoading, error } = useProduct(productId);
  const { data: reviews } = useProductReviews(productId);
  const addToCart = useAddToCart();
  const { toast } = useToast();
  
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'reviews'>('desc');

  if (isLoading) return <ProductSkeleton />;
  if (error || !product) return <ProductNotFound />;

  const handleAddToCart = () => {
    addToCart.mutate({ productId, quantity });
  };

  const increment = () => setQuantity(q => q + 1);
  const decrement = () => setQuantity(q => Math.max(1, q - 1));

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          
          {/* Image Section */}
          <div className="space-y-4">
            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 shadow-sm relative group">
              <img 
                src={product.imageUrl} 
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <button className="absolute top-4 right-4 p-3 bg-white/80 backdrop-blur rounded-full text-gray-500 hover:text-red-500 hover:bg-white transition-all shadow-sm">
                <Heart className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Info Section */}
          <div className="flex flex-col">
            <div className="mb-2">
              <span className="text-sm font-medium text-accent tracking-wide uppercase">{product.category}</span>
            </div>
            
            <h1 className="font-heading text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center text-yellow-500">
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 text-gray-300" />
              </div>
              <span className="text-gray-400 text-sm border-l pl-4 border-gray-200">{reviews?.length || 0} Reviews</span>
            </div>

            <div className="flex items-baseline gap-4 mb-8">
              <span className="text-3xl font-bold text-gray-900">${Number(product.price).toFixed(2)}</span>
              {product.originalPrice && (
                <span className="text-xl text-gray-400 line-through">${Number(product.originalPrice).toFixed(2)}</span>
              )}
            </div>

            <p className="text-gray-600 leading-relaxed mb-8">
              {product.description}
            </p>

            <div className="h-px bg-gray-100 w-full mb-8" />

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex items-center border border-gray-200 rounded-lg">
                <button onClick={decrement} className="px-4 py-3 hover:bg-gray-50 text-gray-500 transition-colors">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 font-medium min-w-[3rem] text-center">{quantity}</span>
                <button onClick={increment} className="px-4 py-3 hover:bg-gray-50 text-gray-500 transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <Button 
                onClick={handleAddToCart} 
                disabled={addToCart.isPending}
                size="lg" 
                className="flex-1 bg-primary hover:bg-primary/90 text-lg h-auto py-3 shadow-lg shadow-primary/20"
              >
                {addToCart.isPending ? "Adding..." : "Add to Cart"}
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <Truck className="w-5 h-5 text-accent" />
                <span className="text-sm font-medium text-gray-700">Free Delivery</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <Shield className="w-5 h-5 text-accent" />
                <span className="text-sm font-medium text-gray-700">1 Year Warranty</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-20">
          <div className="flex gap-8 border-b border-gray-200 mb-8">
            <button 
              onClick={() => setActiveTab('desc')}
              className={`pb-4 font-heading font-medium text-lg transition-colors border-b-2 ${activeTab === 'desc' ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Description
            </button>
            <button 
              onClick={() => setActiveTab('reviews')}
              className={`pb-4 font-heading font-medium text-lg transition-colors border-b-2 ${activeTab === 'reviews' ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Reviews ({reviews?.length || 0})
            </button>
          </div>

          <div className="min-h-[200px]">
            {activeTab === 'desc' ? (
              <div className="prose max-w-none text-gray-600">
                <p>{product.description}</p>
                <p>Features:</p>
                <ul>
                  <li>Premium quality fabric</li>
                  <li>Intricate handcrafted details</li>
                  <li>Perfect for special occasions</li>
                </ul>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews?.length === 0 ? (
                  <p className="text-gray-500 italic">No reviews yet.</p>
                ) : (
                  reviews?.map(review => (
                    <div key={review.id} className="border-b border-gray-100 pb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-gray-900">{review.reviewerName}</span>
                        <div className="flex text-yellow-500">
                          {[...Array(5)].map((_, i) => (
                             <Star key={i} className={`w-3 h-3 ${i < review.rating ? "fill-current" : "text-gray-200"}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600">{review.comment}</p>
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
