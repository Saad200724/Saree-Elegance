import { Link } from "wouter";
import { type Product } from "@shared/routes";
import { Button } from "@/components/ui/button";
import { useAddToCart } from "@/hooks/use-cart";
import { ShoppingBag } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addToCart = useAddToCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart.mutate({ productId: product.id, quantity: 1 });
  };

  return (
    <Link href={`/product/${product.id}`} className="group block h-full">
      <div className="relative h-full flex flex-col bg-white overflow-hidden transition-all duration-500 border-none group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
        
        {/* New Arrival Badge - Elegant minimal style */}
        {product.isNewArrival && (
          <div className="absolute top-4 left-4 z-10">
            <span className="bg-primary/90 backdrop-blur-md text-white text-[10px] font-semibold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full shadow-lg">
              New
            </span>
          </div>
        )}

        {/* Image Container with high-end hover effect */}
        <div className="relative aspect-[4/5] overflow-hidden bg-[#F9F8F6]">
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className="w-full h-full object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-105"
          />
          
          {/* Subtle Overlay on Hover */}
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Elegant Quick Add - Slide up effect */}
          <div className="absolute inset-x-0 bottom-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-20">
            <Button 
              onClick={handleAddToCart}
              disabled={addToCart.isPending}
              className="w-full bg-white/90 backdrop-blur-md text-primary hover:bg-primary hover:text-white border-none shadow-2xl transition-all duration-300 font-semibold tracking-wider text-xs h-12 rounded-none uppercase"
            >
              {addToCart.isPending ? "Adding..." : (
                <span className="flex items-center justify-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  Quick Add
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Content - Sophisticated Typography */}
        <div className="flex-1 p-5 flex flex-col items-center text-center space-y-2 bg-white">
          <p className="text-[10px] text-accent font-bold uppercase tracking-[0.25em] mb-1">
            {product.category}
          </p>
          <h3 className="font-heading font-semibold text-gray-900 text-base leading-tight group-hover:text-primary transition-colors duration-300">
            {product.name}
          </h3>
          <div className="pt-1 flex items-center justify-center gap-3">
            <span className="text-sm font-bold text-primary tracking-tight">
              ৳{Number(product.price).toLocaleString()}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through font-light">
                ৳{Number(product.originalPrice).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
