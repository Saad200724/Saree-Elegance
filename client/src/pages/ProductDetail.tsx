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
      
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden border border-gray-100">
              <img 
                src={product.imageUrl} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Thumbnail Placeholder */}
            <div className="flex gap-2">
              <div className="w-20 h-20 rounded border-2 border-primary overflow-hidden">
                <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="flex flex-col">
            <nav className="text-xs text-gray-400 mb-4 flex gap-2">
              <span>Home</span> / <span>{product.category}</span> / <span className="text-gray-600">{product.name}</span>
            </nav>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
            
            <div className="flex items-center gap-2 mb-4">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-xs text-gray-400">(0 reviews)</span>
            </div>

            <div className="text-2xl font-bold text-[#0D3B31] mb-4">
              ৳{Number(product.price).toLocaleString()}
            </div>

            <div className="space-y-4 mb-8">
              <div className="text-sm text-emerald-600 font-medium">In Stock</div>
              <div className="text-sm text-gray-600">Stock: {product.stock}</div>
              
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Quantity:</span>
                <div className="flex items-center border rounded">
                  <button onClick={decrement} className="p-2 hover:bg-gray-50"><Minus className="w-3 h-3" /></button>
                  <span className="w-10 text-center text-sm">{quantity}</span>
                  <button onClick={increment} className="p-2 hover:bg-gray-50"><Plus className="w-3 h-3" /></button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={handleAddToCart} 
                  disabled={addToCart.isPending || product.stock === 0}
                  className="flex-1 bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-md h-12 font-bold flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Add to Cart
                </Button>
              </div>

              <div className="flex gap-4">
                <button className="flex-1 py-2 px-4 border border-gray-200 rounded text-xs font-medium flex items-center justify-center gap-2 hover:bg-gray-50">
                  <Heart className="w-4 h-4" /> Add to Wishlist
                </button>
                <button className="flex-1 py-2 px-4 border border-gray-200 rounded text-xs font-medium flex items-center justify-center gap-2 hover:bg-gray-50">
                  <Share2 className="w-4 h-4" /> Share
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="border-t border-gray-100">
          <div className="flex border-b border-gray-100">
            <button 
              onClick={() => setActiveTab('desc')}
              className={`px-8 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'desc' ? 'border-primary text-primary bg-gray-50' : 'border-transparent text-gray-400'}`}
            >
              Description
            </button>
            <button 
              onClick={() => setActiveTab('reviews')}
              className={`px-8 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'reviews' ? 'border-primary text-primary bg-gray-50' : 'border-transparent text-gray-400'}`}
            >
              Reviews
            </button>
          </div>

          <div className="py-8">
            {activeTab === 'desc' ? (
              <div className="space-y-6">
                <h3 className="font-bold text-lg">Product Description</h3>
                <div className="text-gray-600 text-sm leading-relaxed space-y-4">
                  <p className="font-bold uppercase text-xs">Benefits</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>{product.description}</li>
                    <li>Crafted with premium materials for lasting comfort.</li>
                    <li>Authentic design with attention to heritage details.</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 text-sm italic">
                No reviews yet. Be the first to review this product.
              </div>
            )}
          </div>
        </div>

        {/* Recommended Products */}
        {recommendedProducts.length > 0 && (
          <div className="mt-16">
            <h3 className="text-xl font-bold mb-8">Recommended Products</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {recommendedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
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
