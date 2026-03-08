import { useRoute, useLocation } from "wouter";
import { useProduct, useProductReviews, useProducts } from "@/hooks/use-products";
import { useAddToCart } from "@/hooks/use-cart";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star, Heart, Minus, Plus, ShoppingBag, ShieldCheck, Truck, RotateCcw, Send } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { buildUrl } from "@shared/routes";

export default function ProductDetail() {
  const [match, params] = useRoute("/product/:id");
  const [, setLocation] = useLocation();
  const productId = parseInt(params?.id || "0");
  
  const { data: product, isLoading, error } = useProduct(productId);
  const { data: reviews } = useProductReviews(productId);
  const { data: allProducts } = useProducts({});
  const addToCart = useAddToCart();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'reviews'>('desc');
  const [selectedImage, setSelectedImage] = useState(0);

  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);

  const reviewMutation = useMutation({
    mutationFn: async (data: { reviewerName: string; rating: number; comment: string }) => {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to submit review");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products/:id", productId, "reviews"] });
      setReviewName("");
      setReviewRating(5);
      setReviewComment("");
      toast({ title: "Review submitted!", description: "Thank you for your feedback" });
    },
    onError: (err: any) => {
      toast({ title: "Failed to submit review", description: err.message, variant: "destructive" });
    },
  });

  if (isLoading) return <ProductSkeleton />;
  if (error || !product) return <ProductNotFound />;

  const allImages = [product.imageUrl, ...((product as any).secondaryImages || [])].filter(Boolean);

  const recommendedProducts = allProducts
    ?.filter(p => p.id !== product.id && p.category === product.category)
    .slice(0, 4) || [];

  const handleAddToCart = () => {
    addToCart.mutate({ productId, quantity });
  };

  const increment = () => setQuantity(q => q + 1);
  const decrement = () => setQuantity(q => Math.max(1, q - 1));

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    reviewMutation.mutate({
      reviewerName: reviewName,
      rating: reviewRating,
      comment: reviewComment,
    });
  };

  const avgRating = reviews && reviews.length > 0
    ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0";

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFDFD]">
      <Navbar />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 py-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
          <div className="space-y-6">
            <div className="aspect-square rounded-[2.5rem] overflow-hidden bg-white border border-gray-100 shadow-2xl shadow-gray-200/50 group relative">
              <img 
                src={allImages[selectedImage] || product.imageUrl} 
                alt={product.name}
                className="w-full h-full object-contain transition-transform duration-700"
                data-testid="img-product-main"
              />
              {product.isNewArrival && (
                <div className="absolute top-8 left-8 bg-black text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-xl">
                  New Arrival
                </div>
              )}
            </div>
            
            {allImages.length > 1 && (
              <div className="flex gap-4">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-24 h-24 rounded-2xl overflow-hidden shadow-lg cursor-pointer transition-all ${
                      selectedImage === idx 
                        ? 'border-2 border-primary shadow-primary/10' 
                        : 'border border-gray-100 opacity-60 hover:opacity-100'
                    }`}
                    data-testid={`button-thumbnail-${idx}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            {allImages.length <= 1 && (
              <div className="flex gap-4">
                <div className="w-24 h-24 rounded-2xl border-2 border-primary overflow-hidden shadow-lg shadow-primary/10 cursor-pointer">
                  <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col pt-4">
            <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-8">
              <a href="/" className="hover:text-primary transition-colors">Home</a>
              <span className="w-1 h-1 bg-gray-200 rounded-full" />
              <a href={`/${product.category.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-primary transition-colors">{product.category}</a>
              <span className="w-1 h-1 bg-gray-200 rounded-full" />
              <span className="text-gray-900">{product.name}</span>
            </nav>

            <h1 className="text-5xl font-black text-gray-900 tracking-tighter italic mb-4 leading-tight" data-testid="text-product-name">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-6 mb-10">
              <div className="flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-full">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(Number(avgRating)) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                ))}
              </div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {reviews?.length || 0} Verified Reviews
              </span>
            </div>

            <div className="flex items-baseline gap-4 mb-10">
              <span className="text-6xl font-black text-primary tracking-tighter italic" data-testid="text-product-price">
                ৳{Number(product.price).toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="text-2xl text-gray-300 line-through font-bold decoration-2">
                  ৳{Number(product.originalPrice).toLocaleString()}
                </span>
              )}
            </div>

            <div className="space-y-10">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-widest text-emerald-600">In Stock</span>
                </div>
                <div className="h-4 w-px bg-gray-100" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  SKU: RUP-{product.id.toString().padStart(5, '0')}
                </span>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Select Quantity</p>
                <div className="inline-flex items-center bg-white border border-gray-100 rounded-2xl p-2 shadow-sm">
                  <button 
                    onClick={decrement}
                    data-testid="button-decrement"
                    className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 rounded-xl transition-colors text-gray-400 hover:text-gray-900"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-16 text-center font-black text-xl italic" data-testid="text-quantity">{quantity}</span>
                  <button 
                    onClick={increment}
                    data-testid="button-increment"
                    className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 rounded-xl transition-colors text-gray-400 hover:text-gray-900"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={handleAddToCart} 
                  disabled={addToCart.isPending || product.stock === 0}
                  data-testid="button-add-to-cart"
                  className="flex-1 h-20 bg-gray-900 hover:bg-black text-white rounded-[1.5rem] font-black text-xl italic flex items-center justify-center gap-4 shadow-2xl shadow-gray-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <ShoppingBag className="w-6 h-6" />
                  {addToCart.isPending ? "Adding..." : "Add to Cart"}
                </Button>
                <button className="w-20 h-20 border border-gray-100 rounded-[1.5rem] flex items-center justify-center hover:bg-gray-50 transition-all group">
                  <Heart className="w-6 h-6 text-gray-300 group-hover:text-red-500 transition-colors" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10 border-t border-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Truck className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">Fast Shipping</span>
                    <span className="text-[9px] font-bold text-gray-400">Nationwide delivery</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">100% Authentic</span>
                    <span className="text-[9px] font-bold text-gray-400">Genuine products</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                    <RotateCcw className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">Easy Returns</span>
                    <span className="text-[9px] font-bold text-gray-400">7-day policy</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-100/30 overflow-hidden mb-20">
          <div className="flex border-b border-gray-50">
            <button 
              onClick={() => setActiveTab('desc')}
              data-testid="tab-description"
              className={`px-12 py-8 text-xs font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'desc' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Description
              {activeTab === 'desc' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full mx-10" />}
            </button>
            <button 
              onClick={() => setActiveTab('reviews')}
              data-testid="tab-reviews"
              className={`px-12 py-8 text-xs font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'reviews' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Reviews ({reviews?.length || 0})
              {activeTab === 'reviews' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full mx-10" />}
            </button>
          </div>

          <div className="p-12">
            {activeTab === 'desc' ? (
              <div className="max-w-3xl space-y-8">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 mb-6 italic tracking-tight">Product Story</h3>
                  <p className="text-gray-500 font-medium leading-loose text-lg">
                    {product.description}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-8 border-t border-gray-50">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Fabric & Care</h4>
                    <ul className="space-y-3 text-sm font-bold text-gray-600">
                      <li className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 bg-gray-200 rounded-full" />
                        Premium Quality Fabric
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 bg-gray-200 rounded-full" />
                        Dry Clean Recommended
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Specifications</h4>
                    <ul className="space-y-3 text-sm font-bold text-gray-600">
                      <li className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 bg-gray-200 rounded-full" />
                        {product.category}
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 bg-gray-200 rounded-full" />
                        Intricate Artisanal Work
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-10">
                <form onSubmit={handleReviewSubmit} className="bg-gray-50 rounded-2xl p-8 space-y-6">
                  <h3 className="text-xl font-black text-gray-900 italic tracking-tight">Write a Review</h3>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Your Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          data-testid={`button-star-${star}`}
                          className="p-1 transition-transform hover:scale-110"
                        >
                          <Star className={`w-6 h-6 ${
                            star <= (hoverRating || reviewRating) 
                              ? 'fill-amber-400 text-amber-400' 
                              : 'text-gray-300'
                          }`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Your Name</label>
                      <Input
                        data-testid="input-reviewer-name"
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        placeholder="Enter your name"
                        required
                        className="bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Your Review</label>
                    <Textarea
                      data-testid="input-review-comment"
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your experience with this product..."
                      required
                      className="bg-white min-h-[100px]"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={reviewMutation.isPending}
                    data-testid="button-submit-review"
                    className="bg-gray-900 hover:bg-black text-white rounded-xl font-bold px-8"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {reviewMutation.isPending ? "Submitting..." : "Submit Review"}
                  </Button>
                </form>

                {reviews && reviews.length > 0 ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl font-black italic text-gray-900">{avgRating}</span>
                      <div>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < Math.round(Number(avgRating)) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    {reviews.map((review: any) => (
                      <div key={review.id} className="border-t border-gray-100 pt-6" data-testid={`review-${review.id}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-bold text-gray-900">{review.reviewerName}</h4>
                            <div className="flex gap-0.5 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                              ))}
                            </div>
                          </div>
                          <span className="text-xs text-gray-400">
                            {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No reviews yet - be the first to review!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {recommendedProducts.length > 0 && (
          <div className="space-y-12">
            <div className="flex items-end justify-between">
              <div>
                <h3 className="text-4xl font-black text-gray-900 tracking-tighter italic">Similar Finds.</h3>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-2">More from the {product.category} collection</p>
              </div>
              <Button variant="ghost" className="font-black text-xs uppercase tracking-widest" asChild>
                <a href="/shop">View All</a>
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
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
    <div className="min-h-screen flex flex-col bg-[#FDFDFD]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <Skeleton className="aspect-[4/5] w-full rounded-[3rem]" />
          <div className="space-y-10 py-10">
            <Skeleton className="h-6 w-48 rounded-full" />
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-16 w-64 rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-[2rem]" />
            <div className="flex gap-4">
              <Skeleton className="h-20 flex-1 rounded-[1.5rem]" />
              <Skeleton className="h-20 w-20 rounded-[1.5rem]" />
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
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-8">
          <ShoppingBag className="w-10 h-10 text-gray-200" />
        </div>
        <h2 className="text-4xl font-black italic tracking-tighter mb-4">Product Not Found.</h2>
        <p className="text-gray-400 font-bold text-sm uppercase tracking-widest mb-10">The item you're looking for has moved or no longer exists</p>
        <Button size="lg" className="h-16 px-10 rounded-2xl font-black text-xs uppercase tracking-widest" asChild>
          <a href="/shop">Back to Shop</a>
        </Button>
      </div>
      <Footer />
    </div>
  )
}
