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
    <Link href={`/product/${product.id}`} className="group block">
      <div className="relative flex flex-col transition-all duration-700">
        {/* Luxury Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-[#f4f4f4]">
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className="w-full h-full object-cover object-center transition-transform duration-[1.5s] ease-[cubic-bezier(0.2,0,0,1)] group-hover:scale-110"
          />
          
          {/* Subtle Gradeint Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* New Arrival - Minimalist Tab */}
          {product.isNewArrival && (
            <div className="absolute top-0 left-6">
              <div className="bg-primary text-white text-[9px] font-bold uppercase tracking-[0.3em] px-3 py-4 [writing-mode:vertical-lr] shadow-xl">
                New
              </div>
            </div>
          )}

          {/* Add to Cart - Luxury Minimalist Button */}
          <div className="absolute inset-x-0 bottom-8 px-8 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-[cubic-bezier(0.2,0,0,1)]">
            <Button 
              onClick={handleAddToCart}
              disabled={addToCart.isPending}
              className="w-full bg-white text-black hover:bg-black hover:text-white border-none rounded-none h-12 text-[10px] font-bold uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(0,0,0,0.15)] transition-all duration-300"
            >
              {addToCart.isPending ? "Adding..." : (
                <span className="flex items-center justify-center gap-2">
                  Add to Cart
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Content - High-End Minimalist Typography */}
        <div className="pt-6 pb-4 flex flex-col space-y-2">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <h3 className="font-heading text-sm font-semibold text-gray-900 tracking-tight group-hover:text-primary transition-colors duration-300 uppercase">
                {product.name}
              </h3>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mt-1">
                {product.category}
              </p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm font-bold text-gray-900">
                ৳{Number(product.price).toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="text-[10px] text-gray-400 line-through font-light mt-0.5">
                  ৳{Number(product.originalPrice).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
